import { Avro } from '../src';
import { AvroObject } from '../src/AvroSchema';
import { SchemaReflectionHelper } from '@ts-messaging/common';

@Avro.Record({
  name: 'testRecord',
})
class TestRecord {
  @Avro.Int({
    default: 1,
  })
  myInt: number;

  @Avro.Boolean()
  myBoolean: boolean;

  @Avro.String({ doc: 'This is a test string.' })
  myString: string;
}

const avro = new Avro();

const schemaFactory = new avro.SchemaFactoryConstructor();

function SchemaOf<T extends AvroObject>(target: { new (): T }) {
  const rawSchema = SchemaReflectionHelper.useSafeReflectWithError(target);

  return schemaFactory.produce<T>({
    __id: 1,
    rawSchema: rawSchema as any,
  });
}

describe('Test: AvroSchemaDecorator.ts', () => {
  it('Test Validator.', () => {
    const example = new TestRecord();
    const schema = SchemaOf(TestRecord);

    example.myBoolean = true;
    example.myString = 'test';

    //Validate the object
    expect(schema.validate(example).success).toBe(true);
  });

  it('Test for Int.', () => {
    const example = new TestRecord();
    const schema = SchemaOf(TestRecord);

    example.myInt = 1;
    example.myBoolean = true;
    example.myString = 'test';

    //Validate the object
    expect(schema.validate(example).success).toBe(true);

    //Check for Int
    example.myInt = 1.1;
    expect(schema.validate(example).success).toBe(false);
  });

  it('Test Encoding.', () => {
    const example = new TestRecord();
    const schema = SchemaOf(TestRecord);

    example.myInt = 1;
    example.myBoolean = true;
    example.myString = 'test';

    const encoded = schema.encode(example);

    //Validate the object
    expect(encoded.toString()).toBeTypeOf('string');

    const decoded = schema.decode(encoded);

    expect(decoded?.myInt).toBe(1);
  });
});
