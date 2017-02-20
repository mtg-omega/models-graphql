import { graphql } from 'graphql';

import Schema from '../../graphql';
import { sequelize, Edition, EditionI18N, Single, SingleI18N } from '../../sql';

describe('GraphQL', () => {
  describe('Edition', () => {
    it('should have the "edition" type', () => graphql(Schema, '{ __type(name: "edition") { name fields { name } } }')
      .then((result) => {
        expect(result.errors).not.toBeDefined();
        expect(result.data).toBeDefined();

        const type = result.data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('edition');
        expect(type.fields).toHaveLength(3);

        expect(type.fields).toContainEqual({ name: 'code' });
        expect(type.fields).toContainEqual({ name: 'name' });
        expect(type.fields).toContainEqual({ name: 'singles' });
      }));
  });

  describe('Query', () => {
    const code = 'bbb';
    const language = 'en';
    const name = 'edition a';

    const index = 6;
    const singleName = 'single a';

    beforeEach(() => sequelize.sync({ force: true })
      .then(() => Edition.create({
        code,
        i18n: [{ language, name }],
        singles: [{
          index,
          i18n: [{ name: singleName, language }],
        }],
      }, {
        include: [
          { model: EditionI18N, as: 'i18n' },
          { model: Single, include: [{ model: SingleI18N, as: 'i18n' }] },
        ],
      })));

    describe('Basic', () => {
      it('should return 1 edition', () => graphql(Schema, '{ editions { code } }')
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { editions } = data;
          expect(editions).toHaveLength(1);

          const edition = editions[0];
          expect(edition.code).toBe(code);
        }));

      it('should return 1 edition', () => graphql(Schema, `{ editions(code: "${code}") { code } }`)
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { editions } = data;
          expect(editions).toHaveLength(1);

          const edition = editions[0];
          expect(edition.code).toBe(code);
        }));

      it('should return no editions', () => graphql(Schema, `{ editions(code: "${code}b") { code } }`)
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { editions } = data;
          expect(editions).toHaveLength(0);
        }));

      it('should return the edition', () => graphql(Schema, `{ edition(code: "${code}", language: "${language}") { code name } }`)
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { edition } = data;
          expect(edition.code).toBe(code);
          expect(edition.name).toBe(name);
        }));

      it('should return the edition without its name', () => graphql(Schema, `{ edition(code: "${code}") { code name } }`)
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { edition } = data;
          expect(edition.code).toBe(code);
          expect(edition.name).toBeNull();
        }));
    });

    describe('Associations', () => {
      it('should return the singles', () => graphql(Schema, `{ editions(language: "${language}") { code singles { id name } } }`)
        .then(({ data, errors }) => {
          expect(data).toBeDefined();
          expect(errors).not.toBeDefined();

          const { editions } = data;
          expect(editions).toHaveLength(1);

          const [edition] = editions;
          expect(edition.code).toBe(code);
          expect(edition.singles).toHaveLength(1);

          const [single] = edition.singles;
          expect(single.id).toBeDefined();
          expect(single.name).toBe(singleName);
        }));
    });
  });
});
