import { Command } from "./Command";

export class CommandManager {
  private history: Command[] = [];
  private pointer = -1;
  execute(command: Command) {
    // Kill redo future — any new action wipes forward history
    this.history = this.history.slice(0, this.pointer + 1);
    command.execute();
    this.history.push(command);
    this.pointer++;
  }

  undo(): void {
    if (this.pointer < 0) return;
    this.history[this.pointer].undo();
    this.pointer--;
  }
  redo(): void {
    if (this.pointer >= this.history.length - 1) return;
    this.pointer++;
    this.history[this.pointer].execute();
  }
  canUndo(): boolean {
    return this.pointer >= 0;
  }
  canRedo(): boolean {
    return this.pointer < this.history.length - 1;
  }
  record(command: Command): void {
    this.history = this.history.slice(0, this.pointer + 1);
    this.history.push(command);
    this.pointer++;
  }
}
