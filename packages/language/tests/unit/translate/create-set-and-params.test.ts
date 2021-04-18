import { createSetAndParams } from "../../../src/translate";
import gql from "graphql-tag";
import { FieldNode } from "graphql";

describe("createSetAndParams", () => {
  test("should be a function", () => {
    expect(createSetAndParams).toBeInstanceOf(Function);
  });

  describe("@validate", () => {
    test("should throw invalid type", () => {
      const selection = gql`
        {
          SET {
            test(value: $test) @validate(type: INVALID)
          }
        }
      `;

      const setSelections = ((((selection
        ?.definitions[0] as unknown) as FieldNode).selectionSet
        ?.selections as FieldNode[])[0] as FieldNode).selectionSet
        ?.selections as FieldNode[];

      expect(() =>
        createSetAndParams({
          setSelections,
          varName: "test",
          variables: {
            test: "123",
          },
        })
      ).toThrow("@validate invalid type 'INVALID'");
    });

    describe("String", () => {
      test("should throw when value is not a string", () => {
        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: String)
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 123,
            },
          })
        ).toThrow("test @validate invalid type expected String");
      });

      test("should throw when value is not a string (with custom error)", () => {
        const msg = "SET test not a string";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: String, error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 123,
            },
          })
        ).toThrow(msg);
      });

      test("should throw when value is less than minLength", () => {
        const minLength = 2;

        const selection = gql`
          {
            SET {
              test(value: $test) 
                @validate(type: String) 
                @validate(type: String, minLength: ${minLength})

            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "a",
            },
          })
        ).toThrow(
          `test @validate invalid value, expected minLength ${minLength}`
        );
      });

      test("should throw when value is grater than maxLength", () => {
        const maxLength = 2;

        const selection = gql`
          {
            SET {
              test(value: $test)
                @validate(type: String)
                @validate(type: String, maxLength: ${maxLength})
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "abc",
            },
          })
        ).toThrow(
          `test @validate invalid value, expected maxLength ${maxLength}`
        );
      });

      test("should throw when value does not match regex", () => {
        const regex = "user-.*";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: String, regex: "${regex}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "not-valid-regex",
            },
          })
        ).toThrow(`test @validate invalid value, incorrect match`);
      });

      test("should throw when directive is stacked", () => {
        const regex = "user-.*";
        const msg = "Name must start with user-";

        const selection = gql`
          {
            SET {
              test(value: $test)
                @validate(type: String)
                @validate(type: String, minLength: 2)
                @validate(type: String, maxLength: 100)
                @validate(type: String, regex: "${regex}", error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "not-valid-regex",
            },
          })
        ).toThrow(msg);
      });
    });

    describe("Number", () => {
      test("should throw when value is not a number", () => {
        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Number)
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "123",
            },
          })
        ).toThrow("test @validate invalid type expected Number");
      });

      test("should throw when value is not a number (with custom error)", () => {
        const msg = "bad number";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Number, error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: "123",
            },
          })
        ).toThrow(msg);
      });

      test("should throw when value is less then min", () => {
        const min = 10;

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Number, min: ${min})
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 9,
            },
          })
        ).toThrow(`test @validate invalid value, expected min ${min}`);
      });

      test("should throw when value is grater than max", () => {
        const max = 10;

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Number, max: ${max})
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 11,
            },
          })
        ).toThrow(`test @validate invalid value, expected max ${max}`);
      });

      test("should throw when directive is stacked", () => {
        const min = 10;
        const max = 20;
        const msg = "error in this department";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Number, min: ${min}) @validate(type: Number, max: ${max}, error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 30,
            },
          })
        ).toThrow(msg);
      });
    });

    describe("Boolean", () => {
      test("should throw when value is not a boolean", () => {
        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Boolean)
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 30,
            },
          })
        ).toThrow("test @validate invalid type expected Boolean");
      });

      test("should throw when value is not a boolean (with custom error)", () => {
        const msg = "spillage down isle 5";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(type: Boolean, error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {
              test: 30,
            },
          })
        ).toThrow(msg);
      });
    });

    describe("No Type", () => {
      test("should throw when value don't exist (required)", () => {
        const selection = gql`
          {
            SET {
              test(value: $test) @validate(required: true)
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {},
          })
        ).toThrow("test @validate required");
      });

      test("should throw when value don't exist (required) (with custom error)", () => {
        const msg = "bad validate ooooo nooo!";

        const selection = gql`
          {
            SET {
              test(value: $test) @validate(required: true, error: "${msg}")
            }
          }
        `;

        const setSelections = ((((selection
          ?.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections as FieldNode[])[0] as FieldNode).selectionSet
          ?.selections as FieldNode[];

        expect(() =>
          createSetAndParams({
            setSelections,
            varName: "test",
            variables: {},
          })
        ).toThrow(msg);
      });
    });
  });
});
