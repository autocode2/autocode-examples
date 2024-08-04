import commander from '@commander-js/extra-typings';
import path from 'path';
import Git from 'nodegit';
import { execFileSync } from 'child_process';
import { addAllAndCommit } from './utils/git';

const program = new commander.Command();

program
  .description('Generate a new version')
  .argument('<example>', 'Package to generate')
  .argument('[name]', 'Name of the new version')
  .option('-m, --message <message>', 'The commit message')
  .action(async (pkg, name, opts) => {
    const examplePath = path.resolve(__dirname, '..', 'examples', pkg);
    const exampleRepo = await Git.Repository.open(examplePath);
    const status = await exampleRepo.getStatus();
    if (status.length > 0) {
      console.error(`ERROR: Uncommitted changes in ${pkg}`);
      process.exit(1);
    }
    const exampleBranch = await exampleRepo.getCurrentBranch();
    const exampleBranchName = exampleBranch.name().replace('refs/heads/', '');

    const branchBase = exampleBranchName.split('/').slice(0, -1).join('/')
    const baseBranch = branchBase + '/base';
    const timestamp = new Date().toISOString().replace(/[:\-T.Z]/g, '');
    const generatedBranch = `${branchBase}/${timestamp}${name ? `_${name}` : ''}`;
    console.log(`Generating example from: ${baseBranch} to ${generatedBranch}`);

    const baseCommit = await exampleRepo.getBranchCommit(baseBranch);
    await exampleRepo.createBranch(generatedBranch, baseCommit, false);
    await exampleRepo.checkoutBranch(generatedBranch);

    execFileSync(examplePath + "/generate", { cwd: examplePath, stdio: 'inherit' });

    const commitMessage = opts.message || `Generated ${name}`;
    const ref = await addAllAndCommit(exampleRepo, commitMessage);
    console.log(`Generated ${name} at ${ref.toString()}`);
  });

program.parseAsync(process.argv);
