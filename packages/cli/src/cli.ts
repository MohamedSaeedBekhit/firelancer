#! /usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const version = require('../package.json').version;
const program = new Command();

program
    .version(version)
    .usage(`firelancer <command>`)
    .description(
        pc.blue(`
███████╗██╗██████╗ ███████╗██╗      █████╗ ███╗   ██╗ ██████╗███████╗██████╗ 
██╔════╝██║██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║██╔════╝██╔════╝██╔══██╗
█████╗  ██║██████╔╝█████╗  ██║     ███████║██╔██╗ ██║██║     █████╗  ██████╔╝
██╔══╝  ██║██╔══██╗██╔══╝  ██║     ██╔══██║██║╚██╗██║██║     ██╔══╝  ██╔══██╗
██║     ██║██║  ██║███████╗███████╗██║  ██║██║ ╚████║╚██████╗███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝
`),
    );

program
    .command('migrate')
    .description('Generate, run or revert a database migration')
    .action(async () => {
        const { migrateCommand } = await import('./commands/migrate/migrate');
        await migrateCommand();
        process.exit(0);
    });

void program.parseAsync(process.argv);
