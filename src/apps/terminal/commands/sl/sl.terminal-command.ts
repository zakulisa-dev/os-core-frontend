import { TerminalAPI } from '@nameless-os/sdk';

export const initSlCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "sl",
    description: "Steam Locomotive - cure your bad habit of mistyping",
    handler: (_, ctx) => {

      const D51_BASE = [
        "      ====        ________                ___________ ",
        "  _D _|  |_______/        \\__I_I_____===__|_________| ",
        "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
        "   /     |  |   H  |  |     |   |         ||_| |_||   ",
        "  |      |  |   H  |__--------------------| [___] |   ",
        "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
        "  |/ |   |-----------I_____I [][] []  D   |=======|__ "
      ];

      const D51_WHEELS = [
        [
          "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
          " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
          "  \\_/      \\O=====O=====O=====O_/      \\_/            "
        ],
        [
          "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
          " |/-=|___|=O=====O=====O=====O   |_____/~\\___/        ",
          "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
        ],
        [
          "__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__ ",
          " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
          "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
        ],
        [
          "__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__ ",
          " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
          "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
        ],
        [
          "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
          " |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ",
          "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
        ],
        [
          "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
          " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
          "  \\_/      \\_O=====O=====O=====O/      \\_/            "
        ]
      ];

      const COAL_CAR = [
        "                              ",
        "                              ",
        "    _________________         ",
        "   _|                \\_____A  ",
        " =|                        |  ",
        " -|                        |  ",
        "__|________________________|_ ",
        "|__________________________|_ ",
        "   |_D__D__D_|  |_D__D__D_|   ",
        "    \\_/   \\_/    \\_/   \\_/    ",
      ];

      const terminalWidth = 80;
      let position = terminalWidth + 20;
      let frameCounter = 0;

      const generateFrame = (pos) => {
        const wheelFrame = D51_WHEELS[frameCounter % D51_WHEELS.length];

        const locomotive = [...D51_BASE, ...wheelFrame];
        const fullTrain = [];

        fullTrain.push("");

        for (let i = 0; i < Math.max(locomotive.length, COAL_CAR.length); i++) {
          const locoLine = locomotive[i] || "";
          const coalLine = COAL_CAR[i] || "";
          fullTrain.push(locoLine + coalLine);
        }

        fullTrain.push("");

        const lines = fullTrain.map(trainLine => {
          if (!trainLine.trim()) return "";

          if (pos > 0) {
            return " ".repeat(pos) + trainLine;
          } else if (pos < 0) {
            const visiblePart = trainLine.slice(-pos);
            return visiblePart;
          } else {
            return trainLine;
          }
        });

        return lines.join("\n");
      };

      const slId = ctx.io.print(generateFrame(position));

      const animate = () => {
        position -= 2;
        frameCounter++;

        if (position < -120) {
          ctx.ui.deleteMessage(slId);
          return;
        }

        ctx.ui.updateMessage(slId, generateFrame(position));
        setTimeout(animate, 100);
      };

      setTimeout(animate, 100);
    },
  });
};