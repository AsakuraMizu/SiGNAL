import { extendDatabase } from 'koishi-core';
import MongoDatabase from 'koishi-plugin-mongo/dist/database';

declare module 'koishi-core/dist/database' {
  interface Database {
    createSub(id: string, groupId: number): Promise<void>;
    removeSub(id: string, groupId: number): Promise<void>;
    getSubs(groupId: number): Promise<string[]>;
    getAllSub(): Promise<Sub[]>;
  }

  interface Tables {
    sub: Sub;
  }
}

export interface Sub {
  id: string;
  groups: number[];
}

extendDatabase<typeof MongoDatabase>('koishi-plugin-mongo', {
  async createSub(id: string, groupId: number) {
    await this.db.collection('sub')
      .updateOne({
          id,
        }, {
          $addToSet: {
            groups: groupId,
          },
        },
        {
          upsert: true,
        },
      );
  },

  async removeSub(id: string, groupId: number) {
    await this.db.collection('sub')
      .updateOne({
          id,
        },
        {
          $pull: {
            groups: groupId,
          },
        },
      );
  },

  async getSubs(groupId: number) {
    return await this.db.collection('sub')
      .find({
        groups: {
          $elemMatch: {
            $eq: groupId,
          },
        },
      })
      .map(doc => doc.id)
      .toArray();
  },

  async getAllSub() {
    return await this.db.collection('sub')
      .find()
      .toArray();
  }
});
