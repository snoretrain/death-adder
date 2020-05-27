import ResourceGraph from '../router/ResourceGraph';

describe('ResourceGraph', () => {
  type Node = { nextState: number; value: string };
  it('adds a transition at [state][key]', () => {
    const graph = new ResourceGraph<Node>();
    const nextState = 1;
    const pokemon = 'charmander';
    graph.addTransition(0, 'pokemon', { nextState, value: pokemon });
    expect(graph.dfa[0].pokemon.value).toEqual(pokemon);
  });
  it('returns the transition at [state][key]', () => {
    const graph = new ResourceGraph<Node>();
    const nextState = 1;
    const pokemon = 'charmander';
    graph.addTransition(0, 'pokemon', { nextState, value: pokemon });
    const node = graph.getTransition(0, 'pokemon');
    expect(node.value).toEqual(pokemon);
  });
  it('adds a new state for absent nextState', () => {
    const graph = new ResourceGraph<Node>();
    const nextState = 1;
    const pokemon = 'charmander';
    graph.addTransition(0, 'pokemon', { nextState, value: pokemon });
    expect(graph.dfa[nextState]).toEqual({});
  });
});
