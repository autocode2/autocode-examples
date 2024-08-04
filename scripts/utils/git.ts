import Git, { Repository } from 'nodegit';

export async function addAllAndCommit(repo: Repository, message: string) {
  const index = await repo.refreshIndex();
  await index.addAll();
  await index.write();
  const tree = await index.writeTree();
  const head = await repo.getHeadCommit();
  const author = Git.Signature.now("Gareth Andrew", "gingerhendrix@gmail.com");
  const commitId = await repo.createCommit("HEAD", author, author, message, tree, [head]);
  return commitId;
}
