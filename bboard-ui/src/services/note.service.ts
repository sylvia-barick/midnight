import { DeployedNotesAPI, Note } from '../../../api/src/index';

export class NoteService {
  static async create(api: DeployedNotesAPI, title: string, content: string): Promise<Note> {
    return await api.createNote(title, content);
  }

  static async update(api: DeployedNotesAPI, idHex: string, title: string, content: string): Promise<Note> {
    return await api.updateNote(idHex, title, content);
  }

  static async delete(api: DeployedNotesAPI, idHex: string): Promise<void> {
    return await api.deleteNote(idHex);
  }
}
