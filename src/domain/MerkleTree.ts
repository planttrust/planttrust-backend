import crypto from 'crypto';

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(leaves: string[]) {
    this.leaves = leaves.map(leaf => this.hash(leaf));
    this.layers = [this.leaves];
    this.buildTree();
  }

  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private combineHashes(left: string, right: string): string {
    return this.hash(left + right);
  }

  private buildTree(): void {
    let currentLayer = this.layers[0];
    if (currentLayer.length === 0) {
      this.layers.push(['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']);
      return;
    }

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.combineHashes(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): string {
    const top = this.layers[this.layers.length - 1];
    return top && top[0] ? top[0] : '';
  }

  public generateProof(leafData: string): string[] {
    const targetHash = this.hash(leafData);
    const proof: string[] = [];
    let index = this.layers[0].indexOf(targetHash);

    if (index === -1) return [];

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2 === 1;
      const pairIndex = isRight ? index - 1 : index + 1;

      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      }
      index = Math.floor(index / 2);
    }

    return proof;
  }
}
