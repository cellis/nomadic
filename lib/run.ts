import create from "./create";
import processYargs from "./util/processYargs";

export default function() {
  const args = processYargs()

  console.log('args:', { args })

  switch(args.action) {
    case 'create':
      create(args)
  }
}