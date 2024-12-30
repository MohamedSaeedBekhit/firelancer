import fs from 'fs-extra';
import path from 'node:path';
import { Node, ObjectLiteralExpression, Project, SourceFile, SyntaxKind, VariableDeclaration } from 'ts-morph';

export class FirelancerConfigRef {
    readonly sourceFile: SourceFile;
    readonly configObject: ObjectLiteralExpression;

    constructor(
        private project: Project,
        options: { checkFileName?: boolean } = {},
    ) {
        const checkFileName = options.checkFileName ?? true;

        const getFirelancerConfigSourceFile = (sourceFiles: SourceFile[]) => {
            return sourceFiles.find((sf) => {
                return (
                    (checkFileName ? sf.getFilePath().endsWith('firelancer-config.ts') : true) &&
                    sf.getVariableDeclarations().find((v) => this.isFirelancerConfigVariableDeclaration(v))
                );
            });
        };

        const findAndAddFirelancerConfigToProject = () => {
            // If the project does not contain a firelancer-config.ts file, we'll look for a firelancer-config.ts file
            // in the src directory.
            const srcDir = project.getDirectory('src');
            if (srcDir) {
                const srcDirPath = srcDir.getPath();
                const srcFiles = fs.readdirSync(srcDirPath);

                const filePath = srcFiles.find((file) => file.includes('firelancer-config.ts'));
                if (filePath) {
                    project.addSourceFileAtPath(path.join(srcDirPath, filePath));
                }
            }
        };

        let firelancerConfigFile = getFirelancerConfigSourceFile(project.getSourceFiles());
        if (!firelancerConfigFile) {
            findAndAddFirelancerConfigToProject();
            firelancerConfigFile = getFirelancerConfigSourceFile(project.getSourceFiles());
        }
        if (!firelancerConfigFile) {
            throw new Error('Could not find the FirelancerConfig declaration in your project.');
        }
        this.sourceFile = firelancerConfigFile;
        this.configObject = firelancerConfigFile
            ?.getVariableDeclarations()
            .find((v) => this.isFirelancerConfigVariableDeclaration(v))
            ?.getChildren()
            .find(Node.isObjectLiteralExpression) as ObjectLiteralExpression;
    }

    getPathRelativeToProjectRoot() {
        return path.relative(this.project.getRootDirectories()[0]?.getPath() ?? '', this.sourceFile.getFilePath());
    }

    getConfigObjectVariableName() {
        return this.sourceFile
            ?.getVariableDeclarations()
            .find((v) => this.isFirelancerConfigVariableDeclaration(v))
            ?.getName();
    }

    getPluginsArray() {
        return this.configObject.getProperty('plugins')?.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
    }

    addToPluginsArray(text: string) {
        this.getPluginsArray()?.addElement(text).formatText();
    }

    private isFirelancerConfigVariableDeclaration(v: VariableDeclaration) {
        return v.getType().getText(v) === 'FirelancerConfig';
    }
}
