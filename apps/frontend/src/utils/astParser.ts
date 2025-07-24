import * as ts from "typescript";

export interface ParsedInterface {
  name: string;
  properties: Property[];
  methods?: Method[];
}

export interface Property {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface Method {
  name: string;
  parameters: Property[];
  returnType: string;
}

export function parseTypeScript(code: string): ParsedInterface[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const interfaces: ParsedInterface[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceInfo: ParsedInterface = {
        name: node.name.text,
        properties: [],
        methods: [],
      };

      node.members.forEach((member) => {
        if (ts.isPropertySignature(member)) {
          const property: Property = {
            name: (member.name as ts.Identifier).text,
            type: getTypeString(member.type),
            optional: !!member.questionToken,
            description: getJSDocComment(member),
          };
          interfaceInfo.properties.push(property);
        } else if (ts.isMethodSignature(member)) {
          const method: Method = {
            name: (member.name as ts.Identifier).text,
            parameters: member.parameters.map((param) => ({
              name: (param.name as ts.Identifier).text,
              type: getTypeString(param.type),
              optional: !!param.questionToken,
            })),
            returnType: getTypeString(member.type),
          };
          interfaceInfo.methods?.push(method);
        }
      });

      interfaces.push(interfaceInfo);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return interfaces;
}

function getTypeString(typeNode: ts.TypeNode | undefined): string {
  if (!typeNode) return "any";

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return "string";
    case ts.SyntaxKind.NumberKeyword:
      return "number";
    case ts.SyntaxKind.BooleanKeyword:
      return "boolean";
    case ts.SyntaxKind.TypeReference:
      const typeRef = typeNode as ts.TypeReferenceNode;
      return (typeRef.typeName as ts.Identifier).text;
    default:
      return typeNode.getText();
  }
}

function getJSDocComment(node: ts.Node): string | undefined {
  const jsDoc = (node as any).jsDoc;
  if (jsDoc && jsDoc.length > 0) {
    return jsDoc[0].comment;
  }
  return undefined;
}
