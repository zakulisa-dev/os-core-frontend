import { create } from 'zustand';
import { getCalcResult } from '@Calculator/logic/getCalculatorResult';
import { AddToCalculatorInput, SetCalculatorInputProps } from '@Calculator/types/calculatorStore.type';
import { AppInstanceId } from '@nameless-os/sdk';

type CalculatorData = {
  inputValue: string;
  lastOperations: [string, string, string];
};

type CalculatorStore = {
  calculatorsData: Record<AppInstanceId, CalculatorData>;

  get: (instanceId: AppInstanceId) => CalculatorData | undefined;
  init: (instanceId: AppInstanceId) => void;
  close: (instanceId: AppInstanceId) => void;

  getCalculatorResultAndUpdateLastOperations: (instanceId: AppInstanceId) => void;

  addToCalculatorInput: (payload: AddToCalculatorInput) => void;
  deleteLastCalculatorInputCharacter: (instanceId: AppInstanceId) => void;
  setCalculatorInput: (payload: SetCalculatorInputProps) => void;
  clearCalculatorInput: (instanceId: AppInstanceId) => void;
};

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  calculatorsData: {},

  get: (instanceId) => get().calculatorsData[instanceId],

  init: (instanceId) =>
    set((state) => {
      if (state.calculatorsData[instanceId]) return state;
      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            inputValue: '',
            lastOperations: ['', '', ''],
          },
        },
      };
    }),

  close: (instanceId) =>
    set((state) => {
      const { [instanceId]: removed, ...rest } = state.calculatorsData;
      return {
        calculatorsData: rest,
      };
    }),

  getCalculatorResultAndUpdateLastOperations: (instanceId) =>
    set((state) => {
      const calculator = state.calculatorsData[instanceId];
      if (!calculator) return state;

      const result = getCalcResult(calculator.inputValue);
      if (result === 'OpErr') {
        return state;
      }

      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            ...calculator,
            lastOperations: [
              `${calculator.inputValue.replace(/\s+/g, '')} = ${result}`,
              calculator.lastOperations[0],
              calculator.lastOperations[1],
            ],
            inputValue: result,
          },
        },
      };
    }),

  addToCalculatorInput: ({ instanceId, inputValue }) =>
    set((state) => {
      const calculator = state.calculatorsData[instanceId];
      if (!calculator) return state;

      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            ...calculator,
            inputValue: calculator.inputValue + inputValue,
          },
        },
      };
    }),

  deleteLastCalculatorInputCharacter: (instanceId) =>
    set((state) => {
      const calculator = state.calculatorsData[instanceId];
      if (!calculator) return state;
      if (calculator.inputValue === 'Error' || calculator.inputValue === 'Infinity') return state;

      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            ...calculator,
            inputValue: calculator.inputValue.slice(0, calculator.inputValue.length - 1),
          },
        },
      };
    }),

  setCalculatorInput: ({ instanceId, inputValue }) =>
    set((state) => {
      const calculator = state.calculatorsData[instanceId];
      if (!calculator) return state;

      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            ...calculator,
            inputValue,
          },
        },
      };
    }),

  clearCalculatorInput: (instanceId) =>
    set((state) => {
      const calculator = state.calculatorsData[instanceId];
      if (!calculator) return state;

      return {
        calculatorsData: {
          ...state.calculatorsData,
          [instanceId]: {
            ...calculator,
            inputValue: '',
          },
        },
      };
    }),
}));