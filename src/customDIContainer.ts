type ServiceInitializer<T = unknown> = (...dependencies: any[]) => T | Promise<T>;

interface ServiceDescriptor<T = unknown> {
  initializer: ServiceInitializer<T>;
  dependencies: string[];
  initialized: boolean;
  isInitializing: boolean;
  instance?: T;
}

export class CustomDIContainer {
  private services = new Map<string, ServiceDescriptor>();

  register<T = unknown>(
    name: string,
    initializer: ServiceInitializer<T>,
    dependencies: string[] = []
  ): void {
    this.services.set(name, {
      initializer,
      dependencies,
      initialized: false,
      isInitializing: false
    });
  }

  async initialize<T = unknown>(name: string): Promise<T> {
    const descriptor = this.services.get(name);
    if (!descriptor) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (descriptor.initialized) {
      return descriptor.instance as T;
    }

    if (descriptor.isInitializing) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    descriptor.isInitializing = true;

    try {
      const dependencyInstances: unknown[] = [];
      for (const dep of descriptor.dependencies) {
        const depInstance = await this.initialize(dep);
        dependencyInstances.push(depInstance);
      }

      console.log(`📦 Initializing service: ${name}`);
      descriptor.instance = await descriptor.initializer(...dependencyInstances);
      descriptor.initialized = true;
      console.log(`✅ Service initialized: ${name}`);

      return descriptor.instance as T;

    } finally {
      descriptor.isInitializing = false;
    }
  }

  async initializeAll(): Promise<Record<string, unknown>> {
    console.log('🚀 WebOS Services initialization started');

    const initializedServices: Record<string, unknown> = {};

    for (const serviceName of this.services.keys()) {
      initializedServices[serviceName] = await this.initialize(serviceName);
    }

    console.log('🎉 All WebOS services initialized!');

    return initializedServices;
  }

  get<T = unknown>(name: string): T {
    const descriptor = this.services.get(name);
    if (!descriptor) {
      throw new Error(`Service '${name}' not registered`);
    }
    if (!descriptor.initialized) {
      throw new Error(`Service '${name}' not initialized`);
    }
    return descriptor.instance as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  getStatus(): Record<string, { dependencies: string[]; initialized: boolean }> {
    const status: Record<string, { dependencies: string[]; initialized: boolean }> = {};

    for (const [name, descriptor] of this.services) {
      status[name] = {
        dependencies: descriptor.dependencies,
        initialized: descriptor.initialized
      };
    }

    return status;
  }

  reset(): void {
    for (const descriptor of this.services.values()) {
      descriptor.initialized = false;
      descriptor.isInitializing = false;
      descriptor.instance = undefined;
    }
  }

  clear(): void {
    this.services.clear();
  }
}

export const customDIContainer = new CustomDIContainer();