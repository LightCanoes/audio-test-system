import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';

interface Instruction {
  id: string;
  title: string;
  content: string;
}

export class InstructionManager {
  private instructionsFile: string;

  constructor(appPath: string) {
    this.instructionsFile = join(appPath, 'data', 'instructions.json');
    this.initializeStorage();
    this.setupIpcHandlers();
  }

  private async initializeStorage() {
    try {
      const dir = join(this.instructionsFile, '..');
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(this.instructionsFile);
      } catch {
        // ファイルが存在しない場合は空の配列を作成
        await fs.writeFile(this.instructionsFile, '[]', 'utf-8');
      }
    } catch (error) {
      console.error('Failed to initialize instructions storage:', error);
    }
  }

  private async readInstructions(): Promise<Instruction[]> {
    try {
      const data = await fs.readFile(this.instructionsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeInstructions(instructions: Instruction[]): Promise<void> {
    await fs.writeFile(this.instructionsFile, JSON.stringify(instructions, null, 2), 'utf-8');
  }

  private setupIpcHandlers() {
    // 教示文一覧の取得
    ipcMain.handle('get-instructions', async () => {
      return await this.readInstructions();
    });

    // 新規教示文の作成
    ipcMain.handle('create-instruction', async (event, instruction: Instruction) => {
      const instructions = await this.readInstructions();
      instructions.push(instruction);
      await this.writeInstructions(instructions);
      return instruction;
    });

    // 教示文の更新
    ipcMain.handle('update-instruction', async (event, instruction: Instruction) => {
      const instructions = await this.readInstructions();
      const index = instructions.findIndex(i => i.id === instruction.id);
      if (index !== -1) {
        instructions[index] = instruction;
        await this.writeInstructions(instructions);
        return instruction;
      }
      throw new Error('Instruction not found');
    });

    // 教示文の削除
    ipcMain.handle('delete-instruction', async (event, id: string) => {
      const instructions = await this.readInstructions();
      const filtered = instructions.filter(i => i.id !== id);
      await this.writeInstructions(filtered);
      return true;
    });
  }
}