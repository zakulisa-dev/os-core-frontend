import { AchievementAPI, getErrorMessage, TerminalAPI } from '@nameless-os/sdk';

const initAchievementsCommand = (terminalApi: TerminalAPI, achievementAPI: AchievementAPI) => {
  terminalApi.registerCommand({
    name: "achievements",
    description: "Просмотр всех достижений",
    handler: async (_, ctx) => {
      try {
        const achievements = achievementAPI.getAllAchievements();
        const allProgress = achievementAPI.getAllProgress();

        if (achievements.length === 0) {
          ctx.io.print("📝 Достижения не найдены");
          return;
        }

        ctx.io.print(`\n🏆 \x1b[1mДостижения (${achievements.length})\x1b[0m`);
        ctx.io.print("─".repeat(60));

        achievements.forEach(achievement => {
          const progress = allProgress.find(p => p.id === achievement.id);
          const isCompleted = progress?.completed || false;
          const currentProgress = progress?.current || 0;
          const target = progress?.target || achievement.condition.target || 1;

          const rarityEmojis = {
            common: '🥉',
            uncommon: '🥈',
            rare: '🥇',
            epic: '💎',
            legendary: '👑'
          };

          const statusIcon = isCompleted ? '✅' : '⏳';
          const progressBar = createProgressBar(currentProgress, target, 10);

          ctx.io.print(`${statusIcon} ${rarityEmojis[achievement.rarity]} \x1b[1m${achievement.name}\x1b[0m`);
          ctx.io.print(`   ${achievement.description}`);
          ctx.io.print(`   📊 ${progressBar} ${currentProgress}/${target} | 🎯 ${achievement.points} очков`);

          if (isCompleted && progress?.unlockedAt) {
            const date = new Date(progress.unlockedAt).toLocaleDateString('ru-RU');
            ctx.io.print(`   🎉 Получено: ${date}`);
          }

          ctx.io.print("");
        });

      } catch (error) {
        ctx.io.printError(`❌ Ошибка: ${getErrorMessage(error)}`);
      }
    },
  });
};

function createProgressBar(current: number, target: number, width = 10) {
  const progress = Math.min(current / target, 1);
  const filled = Math.floor(progress * width);
  const empty = width - filled;

  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

export { initAchievementsCommand };