import { NotesAPI, NotesProviders } from '../../../api/src/index';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';

export class ContractService {
  static async deploy(providers: NotesProviders): Promise<NotesAPI> {
    return await NotesAPI.deploy(providers);
  }

  static async join(providers: NotesProviders, address: ContractAddress): Promise<NotesAPI> {
    return await NotesAPI.join(providers, address);
  }
}
