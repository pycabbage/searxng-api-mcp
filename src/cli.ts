#!/usr/bin/env bun

import { cli } from "."

if (import.meta.main) {
  await cli()
}
