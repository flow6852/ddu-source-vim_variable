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
        let src
        switch(command){
          case('function'): break;
          case('let'): break;
          case('set'): break;
          case('autocmd'): break;
        }
        for (const i of (await args.denops.call("ddu#source#vim_variable#_execute", args.sourceParams.command) as string).split("\n")){
          console.log(i)
          // set action data
          const action: ActionData = {
          };

          items.push({word: i, action: action});
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
