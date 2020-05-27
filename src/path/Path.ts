import PathSegment from './PathSegment';

export default class Path {
  pathArray: Array<PathSegment>;

  separator: string = '/';

  variableFlag: string = ':';

  constructor(path?: string) {
    // Enforce leading slash and no trailing slash
    this.pathArray = this.getPathArray(
      this.getCorrectPathString(path)
    );
  }

  getCorrectPathString(path: string): string {
    if (path === '') {
      return '/';
    }
    let correctedPath: string;
    if (path[0] === this.separator) {
      correctedPath = path;
    } else {
      correctedPath = this.separator + path;
    }
    if (correctedPath.slice(-1) === this.separator) {
      correctedPath = correctedPath.slice(
        0,
        correctedPath.length - 1
      );
    }
    return correctedPath;
  }

  getPathArray(path: string): Array<PathSegment> {
    // Remove leading '' result when splitting
    const pathParts: string[] = path.split(this.separator).slice(1);
    return pathParts.map((part) => {
      return new PathSegment(part);
    });
  }

  entries(): IterableIterator<[number, PathSegment]> {
    return this.pathArray.entries();
  }

  getPathPortion(startIndex: number, index: number): string {
    return `/${this.pathArray.slice(startIndex, index).join('/')}`;
  }

  isEnd(index: number): boolean {
    return index + 1 >= this.pathArray.length;
  }

  getSeparator(): string {
    return this.separator;
  }

  length(): number {
    return this.pathArray.length;
  }
}
