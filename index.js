const pkg = require("./package.json");
const program = require("commander");
const {
  create
} = require("./libs/cli/create.js");

program.version(pkg.version, "-v, --version");

program
  .command("book <operateType> [args...]")
  .alias("b")
  .description("Knowledge base related operations")
  .action((type, args) => {
    require("./libs/book/index.js")(type, args);
  });

program
  .command("ftp <operateType> [args...]")
  .alias("f")
  .description("Automatically upload files to Linux")
  .option("-f, --file [fileName]", "配置文件")
  .action((type, args, options) => {
    require("./libs/ftp/index.js")(type, args, options);
  });

program
  .command("create <name>")
  .description("wudl脚手架")
  // .option("-N,--name <name>", "创建项目名")
  .action(async (name, options) => {
    await create(name, options);
  });

program.parse(process.argv);