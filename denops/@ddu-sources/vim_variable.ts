import {
  BaseSource,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";

type Params = {
  type: "function" | "option" | "var" | "event" | "cmdline";
  bufnr: number;
};

export class Source extends BaseSource<Params> {
  override kind = "vim_variable";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        let bufnr = args.sourceParams.bufnr;
        if (bufnr < 1) {
          bufnr = await fn.bufnr(args.denops, "%") as number;
        }
        controller.enqueue(await getVariables(args.denops, args.sourceParams.bufnr))
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      type: "function",
      bufnr: 1,
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
        type: "b",
      },
    });
  }
  // global variables
  for (
    const item of (await fn.getcompletion(
      denops,
      "g:atcoder",
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
        type: "g",
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
        type: "w",
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
        type: "w",
      },
    });
  }

  return items;
}
