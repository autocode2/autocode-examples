import commander from '@commander-js/extra-typings';
import path from 'path';
import Git from 'nodegit';
import { existsSync } from 'node:fs';
import { mkdir, cp } from 'node:fs/promises';
import { execFile, execFileSync } from 'child_process';

const program = new commander.Command();

program
  .description('Publish a package')
  .argument('<package>', 'Package to publish')
  .argument('[name]', 'Name to publish')
  .option('--tag', 'Create a tag in the example repo')
  .option('--no-tag', 'Do not create a tag in the example repo')
  .option('--build', 'Build the example before publishing')
  .option('--no-build', 'Do not build the example before publishing')
  .action(async (pkg, name, opts) => {
    const examplePath = path.resolve(__dirname, '..', 'examples', pkg);
    const exampleRepo = await Git.Repository.open(examplePath);
    const exampleBranch = await exampleRepo.getCurrentBranch();
    const exampleBranchName = exampleBranch.name().replace('refs/heads/', '');
    const publishName = name || exampleBranchName;
    console.log(`Publishing ${pkg} - ${exampleBranchName} to ${publishName}`);

    // Tag as publish name and push
    if (!opts.tag === false) {
      await exampleRepo.createTag(exampleBranch.target(), publishName, "Published example");
    }
    //const exampleRemote = await exampleRepo.getRemote('origin');
    //await exampleRemote.push([`refs/tags/${publishName}:refs/tags/${publishName}`], {
    //callbacks: {
    //certificateCheck: function () {
    //console.log("Skipping certificate check");
    //return 0;
    //},
    //credentials: function (url: string, userName: string) {
    //console.log(`Asking for credentials for ${url} - ${userName}`);
    //return Git.Cred.sshKeyFromAgent(userName);
    //}
    //}
    //});

    process.env['EXAMPLE_PUBLISH_NAME'] = publishName;

    const distPath = path.resolve(examplePath, 'dist');
    if (opts.build !== false) {
      console.log(`Building ${pkg}`);
      execFileSync(examplePath + "/build", { cwd: examplePath, stdio: 'inherit' });
    }

    if (!existsSync(distPath)) {
      console.error(`No dist folder found in ${pkg}`);
      process.exit(1);
    }

    const webPath = path.resolve(__dirname, '..', 'web');
    const webRepo = await Git.Repository.open(webPath);
    const publishPath = path.resolve(webPath, 'examples', pkg, publishName);
    console.log(`Copying dist to ${publishPath}`);

    await mkdir(publishPath, { recursive: true });
    await cp(distPath, publishPath, { recursive: true });

    const index = await webRepo.index()
    await index.addAll(`examples/${pkg}/${publishName}`);
    await index.write();

    const changes = await index.writeTree();
    const head = await Git.Reference.nameToId(webRepo, "HEAD");
    const parent = await webRepo.getCommit(head); // get the commit for current state
    const author = Git.Signature.now("Gareth Andrew", "gingerhendrix@gmail.com");
    // combine all info into commit and return hash
    const message = `Add example ${pkg} - ${publishName}\n\nREF: ${exampleBranch.target().toString()}`;
    await webRepo.createCommit("HEAD", author, author, message, changes, [parent]);

    console.log(`Published: ${exampleBranch.target()} to ${publishName}`);
    const githubUrl = `https://github.com/autocode2/${pkg}/commit/${exampleBranch.target()}`
    const webUrl = `https://autocode2.github.io/autocode-examples/examples/${pkg}/${publishName}`
    console.log(`Github: ${githubUrl}`);
    console.log(`Web: ${webUrl}`);
    console.log(`
* [Generated Code](${githubUrl})
* [View the App](${webUrl})
`);
  });

program.parseAsync(process.argv);
