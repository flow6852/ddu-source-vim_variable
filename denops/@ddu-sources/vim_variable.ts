import {
  BaseSource,
  Item,
  SourceOptions,
  Context
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";

type Params = {
  bufnr: number;
};

export class Source extends BaseSource<Params> {
  override kind = "vim_type";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    context: Context;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        let bufnr = args.sourceParams.bufnr;
        if (bufnr < 1) {
          bufnr = args.context.bufNr;
        }
        controller.enqueue(
          await getVariables(args.denops, args.sourceParams.bufnr),
        );
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      bufnr: 0,
    };
  }
}

async function getVariables(denops: Denops, bufnr: number) {
  const items: Item[] = [];
  // buffer variables
  const bufVars = await fn.getbufvar(
    denops,
    bufnr,
    "",
  ) as string;
  for (
    const [name, value] of Object.entries(bufVars)
  ) {
    items.push({
      word: "b:" + name,
      action: {
        value: value,
        type: "var",
        scope: "b",
      },
    });
  }
  // global variables
  for (
    const item of (await fn.getcompletion(
      denops,
      "g:",
      "var",
    ) as Array<string>)
  ) {
    const src = await vars.globals.get(
      denops,
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: src,
        type: "var",
        scope: "g",
      },
    });
  }

  // window variables
  for (
    const item of (await fn.getcompletion(
      denops,
      "w:",
      "var",
    ) as Array<string>)
  ) {
    const value = await fn.getwinvar(
      denops,
      await fn.win_getid(denops),
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: value,
        type: "var",
        scope: "w",
      },
    });
  }

  // tab variables
  for (
    const item of (await fn.getcompletion(
      denops,
      "t:",
      "var",
    ) as Array<string>)
  ) {
    const value = await fn.gettabvar(
      denops,
      await fn.tabpagenr(denops),
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: value,
        type: "var",
        scope: "t",
      },
    });
  }

  return items;
}
