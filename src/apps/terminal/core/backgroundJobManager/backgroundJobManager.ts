import { CommandContext, TerminalAPI } from '@nameless-os/sdk';

export interface BackgroundJob {
  id: string;
  command: string;
  status: 'running' | 'completed' | 'failed' | 'killed';
  startTime: Date;
  endTime?: Date;
  output: string[];
  error?: string;
  pid?: number;
}

export class BackgroundJobManager {
  private jobs: Map<string, BackgroundJob> = new Map();
  private jobCounter = 0;

  async createJob(command: string, ctx: CommandContext, terminalApi: TerminalAPI): Promise<string> {
    const jobId = this.generateJobId();
    const job: BackgroundJob = {
      id: jobId,
      command,
      status: 'running',
      startTime: new Date(),
      output: [],
    };

    this.jobs.set(jobId, job);

    const jobContext: CommandContext = {
      ...ctx,
      print: (line: string) => {
        const currentJob = this.jobs.get(jobId);
        if (currentJob) {
          const updatedJob: BackgroundJob = {
            ...currentJob,
            output: [...currentJob.output, line],
          };
          this.jobs.set(jobId, updatedJob);
        }
      },
    };

    this.executeJobInBackground(job, jobContext, terminalApi);

    if (ctx.print) {
      ctx.io.print(`[${jobId}] ${command} &`);
    }

    return jobId;
  }

  listJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values()).sort((a, b) =>
      b.startTime.getTime() - a.startTime.getTime(),
    );
  }

  getJob(jobId: string): BackgroundJob | undefined {
    return this.jobs.get(jobId);
  }

  killJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'running') {
      this.updateJobStatus(jobId, 'killed', new Date(), 'Job killed by user');
      return true;
    }

    return false;
  }

  removeJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  clearCompletedJobs(): number {
    const completedJobs = Array.from(this.jobs.entries())
      .filter(([_, job]) => job.status !== 'running');

    completedJobs.forEach(([jobId]) => this.jobs.delete(jobId));

    return completedJobs.length;
  }

  registerCommands(terminalApi: TerminalAPI): void {
    terminalApi.registerCommand({
      name: 'jobs',
      description: 'List background jobs',
      flags: [
        { name: 'all', aliases: ['a'], type: 'boolean', description: 'Show all jobs including completed' },
        { name: 'running', aliases: ['r'], type: 'boolean', description: 'Show only running jobs' },
      ],
      handler: async (args, ctx) => {
        const jobs = this.listJobs();

        let filteredJobs = jobs;
        if (args.flags.running) {
          filteredJobs = jobs.filter(job => job.status === 'running');
        } else if (!args.flags.all) {
          filteredJobs = jobs.filter(job => job.status === 'running' || job.status === 'failed');
        }

        if (filteredJobs.length === 0) {
          ctx.io.print('No jobs found');
          return;
        }

        ctx.io.print('ID\tStatus\t\tCommand\t\tStarted');
        ctx.io.print('--\t------\t\t-------\t\t-------');

        filteredJobs.forEach(job => {
          const duration = job.endTime
            ? `(${Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s)`
            : `(${Math.round((Date.now() - job.startTime.getTime()) / 1000)}s)`;

          const status = job.status === 'running' ? 'Running' :
            job.status === 'completed' ? 'Done' :
              job.status === 'failed' ? 'Failed' : 'Killed';

          ctx.io.print(`${job.id}\t${status}\t\t${job.command}\t\t${job.startTime.toLocaleTimeString()} ${duration}`);
        });
      },
    });

    terminalApi.registerCommand({
      name: 'kill',
      description: 'Kill a background job',
      handler: async (args, ctx) => {
        if (args.positional.length === 0) {
          ctx.io.printError('Usage: kill <job_id>');
          return;
        }

        const jobId = args.positional[0];
        const success = this.killJob(jobId);

        if (success) {
          ctx.io.print(`Job ${jobId} killed`);
        } else {
          ctx.io.printError(`Job ${jobId} not found or not running`);
        }
      },
    });

    terminalApi.registerCommand({
      name: 'fg',
      description: 'Show output of a background job',
      handler: async (args, ctx) => {
        if (args.positional.length === 0) {
          ctx.io.printError('Usage: fg <job_id>');
          return;
        }

        const jobId = args.positional[0];
        const job = this.getJob(jobId);

        if (!job) {
          ctx.io.printError(`Job ${jobId} not found`);
          return;
        }

        ctx.io.print(`=== Job ${jobId}: ${job.command} ===`);
        ctx.io.print(`Status: ${job.status}`);
        ctx.io.print(`Started: ${job.startTime.toLocaleString()}`);
        if (job.endTime) {
          ctx.io.print(`Ended: ${job.endTime.toLocaleString()}`);
        }
        ctx.io.print('--- Output ---');

        if (job.output.length > 0) {
          job.output.forEach(line => ctx.io.print(line));
        } else {
          ctx.io.print('(no output)');
        }

        if (job.error) {
          ctx.io.print('--- Error ---');
          ctx.io.printError(job.error);
        }
      },
    });

    terminalApi.registerCommand({
      name: 'clear-jobs',
      description: 'Clear completed and failed jobs',
      handler: async (args, ctx) => {
        const cleared = this.clearCompletedJobs();
        ctx.io.print(`Cleared ${cleared} completed jobs`);
      },
    });
  }

  private async executeJobInBackground(
    job: BackgroundJob,
    ctx: CommandContext,
    terminalApi: TerminalAPI,
  ): Promise<void> {
    try {
      const cleanCommand = job.command.replace(/\s*&\s*$/, '').trim();

      await terminalApi.executeCommand(cleanCommand, ctx);

      this.updateJobStatus(job.id, 'completed', new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateJobStatus(job.id, 'failed', new Date(), errorMessage);
    }
  }

  private updateJobStatus(
    jobId: string,
    status: BackgroundJob['status'],
    endTime?: Date,
    error?: string,
  ): void {
    const job = this.jobs.get(jobId);
    if (job) {
      const updatedJob: BackgroundJob = {
        ...job,
        status,
        endTime: endTime || job.endTime,
        error: error || job.error,
      };
      this.jobs.set(jobId, updatedJob);
    }
  }

  private generateJobId(): string {
    return (++this.jobCounter).toString();
  }
}