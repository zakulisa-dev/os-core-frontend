import { AppInstanceId } from '@nameless-os/sdk';

interface CalculatorState {
  inputValue: string;
  lastOperations: [string, string, string];
}

interface CalculatorStore {
  calculatorsData: { [key: AppInstanceId]: CalculatorState };
}

interface SetCalculatorInputProps {
  inputValue: string;
  instanceId: AppInstanceId;
}

interface AddToCalculatorInput {
  inputValue: string;
  instanceId: AppInstanceId;
}

export type { CalculatorStore, CalculatorState, SetCalculatorInputProps, AddToCalculatorInput };
