export const VARIABLE = '{VARIABLE}';

export default class PathSegment {
  variableName: string;

  segmentTitle: string;

  constructor(segment: string) {
    if (segment.slice(0, 1) === ':') {
      this.variableName = segment.slice(1);
      this.segmentTitle = VARIABLE;
    } else {
      this.variableName = '';
      this.segmentTitle = segment;
    }
  }

  toString(): string {
    return this.segmentTitle;
  }

  isVariable(): boolean {
    return !!this.variableName;
  }
}
