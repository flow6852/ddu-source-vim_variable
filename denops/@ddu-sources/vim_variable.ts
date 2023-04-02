import {
  BaseSource,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v2.3.0/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.3.2/file.ts";

type Params = {
  command: "function" | "let" | "set" | "autocmd";
};

export class Source extends BaseSource<Params> {
  override kind = "file";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        const items: Item<ActionData>[] = [];
        let src: Array<string> | undefined = undefined;
        switch (args.sourceParams.command) {
          case ("function"):
            src =
              (await args.denops.call(
                "ddu#source#vim_variable#_execute",
                args.sourceParams.command,
              ) as string).split("\n");
            break;
          case ("let"):
            src =
              (await args.denops.call(
                "ddu#source#vim_variable#_execute",
                args.sourceParams.command,
              ) as string).split("\n");
            break;
          case ("set"):
            src =
              (await args.denops.call(
                "ddu#source#vim_variable#_execute",
                args.sourceParams.command,
              ) as string).split("\n");
            break;
          case ("autocmd"):
            src =
              (await args.denops.call(
                "ddu#source#vim_variable#_execute",
                args.sourceParams.command,
              ) as string).split("\n");
            break;
        }
        for (const i of src) {
          let type = "";
          switch (args.sourceParams.command) {
            case ("function"):
              type = i.split(" ")[0];
              break;
            case ("let"):
              type = i.split(" ")[0];
              break;
            case ("set"):
              type = i.split(" ")[0];
              break;
            case ("autocmd"):
              type = i.split(" ")[0];
              break;
          }
          let name = "";
          switch (args.sourceParams.command) {
            case ("function"):
              name = i.split(" ")[1];
              break;
            case ("let"):
              name = i.split(" ")[1];
              break;
            case ("set"):
              name = i.split(" ")[1];
              break;
            case ("autocmd"):
              name = i.split(" ")[1];
              break;
          }
          // set action data
          const action: ActionData = {
            type: type,
            name: name,
          };

          if (name != undefined) items.push({ word: name, action: action });
        }
        controller.enqueue(items);
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      command: "function",
    };
  }
}
