import { spawn } from "node:child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const signByOpenSsl = async (
  buff: Buffer,
  cerFile = `ca.cer`,
  keyFile = `ca.key`,
  defaultType: "DER" | "PEM" = "DER"
): Promise<Buffer> => {
  const guid = uuidv4();
  const inFile = `/tmp/${guid}.txt`;
  const outFile = `/tmp/${guid}.txt.sig`;
  await writeFile(inFile, buff);
  return new Promise((res, rej) => {
    const ssl = spawn("openssl", [
      "smime",
      "-sign",
      "-signer",
      cerFile,
      "-engine",
      "gost",
      "-inkey",
      keyFile,
      "-binary",
      "-outform",
      defaultType,
      "-in",
      inFile,
      "-out",
      outFile,
    ]);
    ssl.on("close", (code) => {
      if (!code) {
        res(readFile(outFile));
        unlink(inFile);
        unlink(outFile);
      }
    });
  });
};
