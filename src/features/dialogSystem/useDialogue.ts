import { create } from 'zustand';

export interface DialogueNode {
  id: string;
  speaker: 'fox' | 'vixie' | 'both';
  position: 'left' | 'right';
  text: string;
  emotion?: 'neutral' | 'excited' | 'tired' | 'ironic';
  autoNext?: number | null;
  next?: string;
  choices?: DialogueChoice[];
  onComplete?: () => void;
}

export interface DialogueChoice {
  text: string;
  next: string;
  action?: () => void;
}

interface DialogueState {
  isActive: boolean;
  currentNode: DialogueNode | null;
  scenario: DialogueNode[];
  visitedNodes: Set<string>;
  isTyping: boolean;

  startDialogue: (scenario: DialogueNode[]) => void;
  nextNode: (choiceId?: string) => void;
  skipDialogue: () => void;
  setTyping: (typing: boolean) => void;
  reset: () => void;
}

export const useDialogue = create<DialogueState>((set, get) => ({
  isActive: false,
  currentNode: null,
  scenario: [],
  visitedNodes: new Set(),
  isTyping: false,

  startDialogue: (scenario) => {
    set({
      isActive: true,
      scenario,
      currentNode: scenario[0] || null,
      visitedNodes: new Set([scenario[0]?.id]),
    });
  },

  nextNode: (choiceId) => {
    const { currentNode, scenario, visitedNodes } = get();
    if (!currentNode) return;

    let nextId: string | undefined;

    if (choiceId) {
      const choice = currentNode.choices?.find((c) => c.next === choiceId);
      if (choice?.action) choice.action();
      nextId = choiceId;
    } else {
      nextId = currentNode.next;
    }

    if (!nextId) {
      if (currentNode.onComplete) currentNode.onComplete();
      get().reset();
      return;
    }

    const nextNode = scenario.find((node) => node.id === nextId);
    if (nextNode) {
      set({
        currentNode: nextNode,
        visitedNodes: new Set([...visitedNodes, nextNode.id]),
        isTyping: true,
      });
    } else {
      get().reset();
    }
  },

  skipDialogue: () => {
    const { currentNode } = get();
    if (currentNode?.onComplete) currentNode.onComplete();
    get().reset();
  },

  setTyping: (typing) => set({ isTyping: typing }),

  reset: () =>
    set({
      isActive: false,
      currentNode: null,
      scenario: [],
      visitedNodes: new Set(),
      isTyping: false,
    }),
}));