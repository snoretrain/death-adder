export type TransitionSet<T> = {
  [transitionKey: string]: T;
};
export type Graph<T> = {
  [routeKey: number]: TransitionSet<T>;
};

interface Node {
  nextState: number;
}

export default class ResourceGraph<T extends Node> {
  dfa: Graph<T>;

  constructor() {
    this.dfa = { 0: {} };
  }

  getTransition(state: number, key: string): T {
    return this.dfa[state][key];
  }

  transitionExists(state: number, key: string): boolean {
    return !!this.dfa[state][key];
  }

  numStates(): number {
    return Object.keys(this.dfa).length;
  }

  addTransition(state: number, key: string, transition: T) {
    this.dfa[state][key] = transition;
    if (transition.nextState !== 0) {
      this.dfa[transition.nextState] = {};
    }
  }
}
