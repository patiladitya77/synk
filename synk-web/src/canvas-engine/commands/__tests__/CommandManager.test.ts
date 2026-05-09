import { CommandManager } from "../CommandManager";
import { Command } from "../Command";

// Mock Command implementation for testing
class MockCommand implements Command {
  public executeCalled = 0;
  public undoCalled = 0;

  execute(): void {
    this.executeCalled++;
  }

  undo(): void {
    this.undoCalled++;
  }

  reset(): void {
    this.executeCalled = 0;
    this.undoCalled = 0;
  }
}

describe("CommandManager", () => {
  let commandManager: CommandManager;

  beforeEach(() => {
    commandManager = new CommandManager();
  });

  describe("undo operation", () => {
    describe("Basic undo functionality", () => {
      it("should invoke command's undo method when undo is called", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        commandManager.undo();

        expect(command.undoCalled).toBe(1);
      });

      it("should be a no-op when history is empty", () => {
        expect(() => commandManager.undo()).not.toThrow();
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should be a no-op when called multiple times on empty history", () => {
        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        expect(commandManager.canUndo()).toBe(false);
      });
    });

    describe("Multiple undo operations", () => {
      it("should execute undos in reverse order (LIFO)", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Reset execute counts to track undo order
        command1.reset();
        command2.reset();
        command3.reset();

        // First undo should undo command3
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(0);
        expect(command1.undoCalled).toBe(0);

        // Second undo should undo command2
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(1);
        expect(command1.undoCalled).toBe(0);

        // Third undo should undo command1
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(1);
        expect(command1.undoCalled).toBe(1);
      });

      it("should handle undo after all commands are undone", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        commandManager.undo();
        expect(command.undoCalled).toBe(1);

        // Additional undo should be a no-op
        commandManager.undo();
        expect(command.undoCalled).toBe(1);
      });
    });

    describe("History pointer management", () => {
      it("should decrement history pointer correctly", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        expect(commandManager.canUndo()).toBe(true);

        commandManager.undo();
        expect(commandManager.canUndo()).toBe(true);

        commandManager.undo();
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should maintain correct pointer after multiple undo operations", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(true);

        commandManager.undo();
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(true);

        commandManager.undo();
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(true);
      });
    });

    describe("canUndo boundary conditions", () => {
      it("should return false when history is empty", () => {
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should return true after executing a command", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        expect(commandManager.canUndo()).toBe(true);
      });

      it("should return false after undoing all commands", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();
        commandManager.undo();

        expect(commandManager.canUndo()).toBe(false);
      });

      it("should return true after partial undo", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();

        expect(commandManager.canUndo()).toBe(true);
      });
    });
  });

  describe("redo operation", () => {
    describe("Basic redo functionality", () => {
      it("should invoke command's execute method when redo is called", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        command.reset();

        commandManager.undo();
        commandManager.redo();

        expect(command.executeCalled).toBe(1);
      });

      it("should be a no-op when there is no redo history", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        expect(() => commandManager.redo()).not.toThrow();
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should be a no-op when called on empty history", () => {
        expect(() => commandManager.redo()).not.toThrow();
        expect(commandManager.canRedo()).toBe(false);
      });
    });

    describe("Multiple redo operations", () => {
      it("should execute redos in forward order (FIFO)", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Undo all commands
        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        // Reset counts to track redo order
        command1.reset();
        command2.reset();
        command3.reset();

        // First redo should redo command1
        commandManager.redo();
        expect(command1.executeCalled).toBe(1);
        expect(command2.executeCalled).toBe(0);
        expect(command3.executeCalled).toBe(0);

        // Second redo should redo command2
        commandManager.redo();
        expect(command1.executeCalled).toBe(1);
        expect(command2.executeCalled).toBe(1);
        expect(command3.executeCalled).toBe(0);

        // Third redo should redo command3
        commandManager.redo();
        expect(command1.executeCalled).toBe(1);
        expect(command2.executeCalled).toBe(1);
        expect(command3.executeCalled).toBe(1);
      });

      it("should handle redo after all commands are redone", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        commandManager.undo();
        command.reset();

        commandManager.redo();
        expect(command.executeCalled).toBe(1);

        // Additional redo should be a no-op
        commandManager.redo();
        expect(command.executeCalled).toBe(1);
      });
    });

    describe("History pointer management", () => {
      it("should increment history pointer correctly", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();
        commandManager.undo();

        expect(commandManager.canRedo()).toBe(true);

        commandManager.redo();
        expect(commandManager.canRedo()).toBe(true);

        commandManager.redo();
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should maintain correct pointer after multiple redo operations", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        commandManager.redo();
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(true);

        commandManager.redo();
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(true);

        commandManager.redo();
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });
    });

    describe("canRedo boundary conditions", () => {
      it("should return false when at end of history", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        expect(commandManager.canRedo()).toBe(false);
      });

      it("should return true after undoing a command", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        commandManager.undo();

        expect(commandManager.canRedo()).toBe(true);
      });

      it("should return false after redoing all commands", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();
        commandManager.undo();

        commandManager.redo();
        commandManager.redo();

        expect(commandManager.canRedo()).toBe(false);
      });

      it("should return true after partial redo", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        commandManager.redo();

        expect(commandManager.canRedo()).toBe(true);
      });
    });
  });

  describe("history management", () => {
    describe("New command clears redo history", () => {
      it("should clear redo history when new command is executed", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();
        expect(commandManager.canRedo()).toBe(true);

        // Execute new command should clear redo history
        commandManager.execute(command3);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should clear multiple redo commands when new command is executed", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();
        const command4 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();
        commandManager.undo();
        expect(commandManager.canRedo()).toBe(true);

        // Execute new command should clear all redo history
        commandManager.execute(command4);
        expect(commandManager.canRedo()).toBe(false);

        // Verify we can't redo command2 or command3
        commandManager.redo();
        expect(command2.executeCalled).toBe(1); // Only initial execute
        expect(command3.executeCalled).toBe(1); // Only initial execute
      });

      it("should maintain undo history when new command is executed", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();

        commandManager.execute(command3);

        // Should still be able to undo command3 and command1
        expect(commandManager.canUndo()).toBe(true);
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);

        expect(commandManager.canUndo()).toBe(true);
        commandManager.undo();
        expect(command1.undoCalled).toBe(1);
      });
    });

    describe("Commands added to history in order", () => {
      it("should add commands to history in execution order", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Verify order by undoing
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(0);
        expect(command1.undoCalled).toBe(0);

        commandManager.undo();
        expect(command2.undoCalled).toBe(1);
        expect(command1.undoCalled).toBe(0);

        commandManager.undo();
        expect(command1.undoCalled).toBe(1);
      });

      it("should maintain order after undo and new execute", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        commandManager.undo();

        commandManager.execute(command3);

        // Verify order: command1, command3
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);

        commandManager.undo();
        expect(command1.undoCalled).toBe(1);
      });
    });

    describe("canUndo and canRedo at boundaries", () => {
      it("should have correct canUndo/canRedo at start", () => {
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should have correct canUndo/canRedo after one execute", () => {
        const command = new MockCommand();
        commandManager.execute(command);

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should have correct canUndo/canRedo after execute and undo", () => {
        const command = new MockCommand();
        commandManager.execute(command);
        commandManager.undo();

        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(true);
      });

      it("should have correct canUndo/canRedo after execute, undo, and redo", () => {
        const command = new MockCommand();
        commandManager.execute(command);
        commandManager.undo();
        commandManager.redo();

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should have correct canUndo/canRedo in middle of history", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        commandManager.undo();

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(true);
      });
    });

    describe("History pointer remains in valid range", () => {
      it("should keep pointer at -1 when history is empty", () => {
        expect(commandManager.canUndo()).toBe(false);
        commandManager.undo();
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should keep pointer at history.length - 1 when at end", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        expect(commandManager.canRedo()).toBe(false);
        commandManager.redo();
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should maintain valid pointer through complex operations", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.undo(); // Undo command2
        commandManager.execute(command3); // Execute command3, clears redo history
        commandManager.undo(); // Undo command3 (undoCalled = 1)
        commandManager.redo(); // Redo command3

        // Reset undo count to track from this point
        command3.undoCalled = 0;

        // Pointer should be valid (can undo command3)
        expect(commandManager.canUndo()).toBe(true);
        commandManager.undo();
        expect(command3.undoCalled).toBe(1);

        // Pointer should be valid (can undo command1)
        expect(commandManager.canUndo()).toBe(true);
        commandManager.undo();
        expect(command1.undoCalled).toBe(1);

        // Pointer should be at -1
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should handle pointer correctly with multiple undo/redo cycles", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        // Cycle 1
        commandManager.undo();
        commandManager.redo();

        // Cycle 2
        commandManager.undo();
        commandManager.redo();

        // Should still be at end of history
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });
    });
  });

  describe("record method", () => {
    it("should add command to history without executing", () => {
      const command = new MockCommand();
      commandManager.record(command);

      expect(command.executeCalled).toBe(0);
      expect(commandManager.canUndo()).toBe(true);
    });

    it("should allow undo of recorded command", () => {
      const command = new MockCommand();
      commandManager.record(command);

      commandManager.undo();

      expect(command.undoCalled).toBe(1);
    });

    it("should clear redo history when recording", () => {
      const command1 = new MockCommand();
      const command2 = new MockCommand();
      const command3 = new MockCommand();

      commandManager.execute(command1);
      commandManager.execute(command2);

      commandManager.undo();
      expect(commandManager.canRedo()).toBe(true);

      commandManager.record(command3);
      expect(commandManager.canRedo()).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty command sequence", () => {
      expect(() => {
        commandManager.undo();
        commandManager.redo();
        commandManager.undo();
      }).not.toThrow();
    });

    it("should handle single command multiple operations", () => {
      const command = new MockCommand();

      commandManager.execute(command);
      commandManager.undo();
      commandManager.redo();
      commandManager.undo();
      commandManager.redo();

      expect(command.executeCalled).toBe(3); // Initial + 2 redos
      expect(command.undoCalled).toBe(2);
    });

    it("should handle alternating execute and undo", () => {
      const command1 = new MockCommand();
      const command2 = new MockCommand();

      commandManager.execute(command1);
      commandManager.undo();
      commandManager.execute(command2);
      commandManager.undo();

      expect(command1.undoCalled).toBe(1);
      expect(command2.undoCalled).toBe(1);
      expect(commandManager.canUndo()).toBe(false);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle typical user workflow", () => {
      const command1 = new MockCommand();
      const command2 = new MockCommand();
      const command3 = new MockCommand();
      const command4 = new MockCommand();

      // User creates shapes
      commandManager.execute(command1);
      commandManager.execute(command2);
      commandManager.execute(command3);

      // User undoes last action
      commandManager.undo();
      expect(command3.undoCalled).toBe(1);

      // User creates new shape (clears redo)
      commandManager.execute(command4);
      expect(commandManager.canRedo()).toBe(false);

      // User undoes twice
      commandManager.undo();
      commandManager.undo();
      expect(command4.undoCalled).toBe(1);
      expect(command2.undoCalled).toBe(1);

      // User redoes once
      commandManager.redo();
      expect(command2.executeCalled).toBe(2); // Initial + redo
    });

    it("should handle complex undo/redo sequence", () => {
      const commands = [
        new MockCommand(),
        new MockCommand(),
        new MockCommand(),
        new MockCommand(),
        new MockCommand(),
      ];

      // Execute all
      commands.forEach((cmd) => commandManager.execute(cmd));

      // Undo 3
      commandManager.undo();
      commandManager.undo();
      commandManager.undo();

      // Redo 2
      commandManager.redo();
      commandManager.redo();

      // Undo 1
      commandManager.undo();

      // Verify state
      expect(commandManager.canUndo()).toBe(true);
      expect(commandManager.canRedo()).toBe(true);

      // Undo to beginning
      commandManager.undo();
      commandManager.undo();
      commandManager.undo();

      expect(commandManager.canUndo()).toBe(false);
      expect(commandManager.canRedo()).toBe(true);
    });
  });

  describe("Command idempotence", () => {
    describe("Execute-undo-redo produces same state as execute", () => {
      it("should produce same state after execute-undo-redo as after execute", () => {
        const command = new MockCommand();

        // Execute command
        commandManager.execute(command);
        expect(command.executeCalled).toBe(1);
        expect(command.undoCalled).toBe(0);

        // Undo command
        commandManager.undo();
        expect(command.executeCalled).toBe(1);
        expect(command.undoCalled).toBe(1);

        // Redo command
        commandManager.redo();
        expect(command.executeCalled).toBe(2);
        expect(command.undoCalled).toBe(1);

        // Final state should match initial execute state
        // (execute called twice: initial + redo, undo called once)
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should handle execute-undo-redo for multiple commands", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        // Execute all commands
        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Undo all
        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        // Redo all
        commandManager.redo();
        commandManager.redo();
        commandManager.redo();

        // Verify final state matches initial executed state
        expect(command1.executeCalled).toBe(2); // Initial + redo
        expect(command2.executeCalled).toBe(2);
        expect(command3.executeCalled).toBe(2);
        expect(command1.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(1);
        expect(command3.undoCalled).toBe(1);

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should handle partial execute-undo-redo sequence", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        // Execute all
        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Undo last two
        commandManager.undo();
        commandManager.undo();

        // Redo last two
        commandManager.redo();
        commandManager.redo();

        // Verify state
        expect(command1.executeCalled).toBe(1); // Only initial execute
        expect(command2.executeCalled).toBe(2); // Initial + redo
        expect(command3.executeCalled).toBe(2); // Initial + redo
        expect(command1.undoCalled).toBe(0);
        expect(command2.undoCalled).toBe(1);
        expect(command3.undoCalled).toBe(1);

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });
    });

    describe("Full undo sequence restores original state", () => {
      it("should restore original state after executing and undoing all commands", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        // Initial state: no commands executed
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(false);

        // Execute all commands
        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Undo all commands
        commandManager.undo();
        commandManager.undo();
        commandManager.undo();

        // Should be back to original state (no undo available, redo available)
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(true);

        // All commands should have been undone
        expect(command1.undoCalled).toBe(1);
        expect(command2.undoCalled).toBe(1);
        expect(command3.undoCalled).toBe(1);
      });

      it("should handle full undo sequence with many commands", () => {
        const commands = Array.from({ length: 10 }, () => new MockCommand());

        // Execute all commands
        commands.forEach((cmd) => commandManager.execute(cmd));

        // Verify all executed
        commands.forEach((cmd) => {
          expect(cmd.executeCalled).toBe(1);
        });

        // Undo all commands
        for (let i = 0; i < 10; i++) {
          commandManager.undo();
        }

        // Verify all undone
        commands.forEach((cmd) => {
          expect(cmd.undoCalled).toBe(1);
        });

        // Should be back to original state
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(true);
      });

      it("should restore original state after complex sequence", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();
        const command3 = new MockCommand();

        // Execute commands
        commandManager.execute(command1);
        commandManager.execute(command2);
        commandManager.execute(command3);

        // Undo some
        commandManager.undo();
        commandManager.undo();

        // Redo some
        commandManager.redo();

        // Undo all
        commandManager.undo();
        commandManager.undo();

        // Should be back to original state
        expect(commandManager.canUndo()).toBe(false);
        expect(commandManager.canRedo()).toBe(true);
      });
    });

    describe("Repeated undo/redo on same command", () => {
      it("should handle repeated undo calls on same command", () => {
        const command = new MockCommand();

        commandManager.execute(command);
        expect(command.executeCalled).toBe(1);

        // First undo
        commandManager.undo();
        expect(command.undoCalled).toBe(1);

        // Second undo (should be no-op)
        commandManager.undo();
        expect(command.undoCalled).toBe(1); // Still 1, not 2

        // State should be at beginning
        expect(commandManager.canUndo()).toBe(false);
      });

      it("should handle repeated redo calls on same command", () => {
        const command = new MockCommand();

        commandManager.execute(command);
        commandManager.undo();

        command.reset();

        // First redo
        commandManager.redo();
        expect(command.executeCalled).toBe(1);

        // Second redo (should be no-op)
        commandManager.redo();
        expect(command.executeCalled).toBe(1); // Still 1, not 2

        // State should be at end
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should handle alternating undo/redo on same command", () => {
        const command = new MockCommand();

        commandManager.execute(command);

        // Undo-redo cycle 1
        commandManager.undo();
        commandManager.redo();

        // Undo-redo cycle 2
        commandManager.undo();
        commandManager.redo();

        // Undo-redo cycle 3
        commandManager.undo();
        commandManager.redo();

        // Verify counts
        expect(command.executeCalled).toBe(4); // Initial + 3 redos
        expect(command.undoCalled).toBe(3);

        // Final state should be at end
        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });

      it("should maintain consistency after multiple undo/redo cycles", () => {
        const command1 = new MockCommand();
        const command2 = new MockCommand();

        commandManager.execute(command1);
        commandManager.execute(command2);

        // Multiple cycles
        for (let i = 0; i < 5; i++) {
          commandManager.undo();
          commandManager.undo();
          commandManager.redo();
          commandManager.redo();
        }

        // Verify final state is consistent
        expect(command1.executeCalled).toBe(6); // Initial + 5 redos
        expect(command2.executeCalled).toBe(6);
        expect(command1.undoCalled).toBe(5);
        expect(command2.undoCalled).toBe(5);

        expect(commandManager.canUndo()).toBe(true);
        expect(commandManager.canRedo()).toBe(false);
      });
    });
  });
});
