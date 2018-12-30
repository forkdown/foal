// std
import { notStrictEqual, strictEqual } from 'assert';

// 3p
import { Column, createConnection, Entity, getConnection, getManager, PrimaryGeneratedColumn } from 'typeorm';

// FoalTS
import { fetchUser } from './fetch-user.util';

function testSuite(type: 'mysql'|'mariadb'|'postgres'|'sqlite') {

  describe(`with ${type}`, () => {

    @Entity()
    class User {
      @PrimaryGeneratedColumn()
      id: number;

      @Column()
      name: string;
    }

    let user: User;

    before(async () => {
      switch (type) {
        case 'mysql':
        case 'mariadb':
          await createConnection({
            database: 'test',
            dropSchema: true,
            entities: [ User ],
            password: 'test',
            synchronize: true,
            type,
            username: 'test',
          });
          break;
        case 'postgres':
          await createConnection({
            database: 'test',
            dropSchema: true,
            entities: [ User ],
            password: 'test',
            synchronize: true,
            type,
            username: 'test',
          });
          break;
        case 'sqlite':
          await createConnection({
            database: 'test_db.sqlite',
            dropSchema: true,
            entities: [ User ],
            synchronize: true,
            type,
          });
          break;
        default:
          break;
        }
      user = new User();
      user.name = 'foobar';
      await getManager().save(user);
    });

    after(() => getConnection().close());

    it('should return the user fetched from the database (id: number).', async () => {
      const actual = await fetchUser(User)(user.id);
      notStrictEqual(actual, undefined);
      strictEqual((actual as User).id, user.id);
    });

    it('should return the user fetched from the database (id: string).', async () => {
      const actual = await fetchUser(User)(user.id.toString());
      notStrictEqual(actual, undefined);
      strictEqual((actual as User).id, user.id);
    });

    it('should return undefined if no user is found in the database.', async () => {
      const actual = await fetchUser(User)(56);
      strictEqual(actual, undefined);
    });

  });

}

describe('fetchUser', () => {

  testSuite('mysql');
  testSuite('mariadb');
  testSuite('sqlite');
  testSuite('postgres');

});
