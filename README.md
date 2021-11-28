# Benchmark of validators

Simple js validator benchmark

- build with: `yarn build`
- run benchmark of simple object with: `yarn benchmark:simple`
- run benchmark of complex object with: `yarn benchmark:complex`


Results
=======

```
Platform info:
--------------
   Linux 5.8.0-7630-generic x64
   Node.JS: 14.17.5
   V8: 8.4.371.23-node.76
   CPU: 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz × 8
   Memory: 15 GB

Suite: Simple object
✔ joi                   193,703 rps
✔ yup                    50,833 rps
✔ ajv                 9,103,966 rps
✔ validate.js           265,246 rps
✔ io-ts               1,973,238 rps
✔ zod                   820,109 rps

   joi               -97.87%        (193,703 rps)   (avg: 5μs)
   yup               -99.44%         (50,833 rps)   (avg: 19μs)
   ajv                    0%      (9,103,966 rps)   (avg: 109ns)
   validate.js       -97.09%        (265,246 rps)   (avg: 3μs)
   io-ts             -78.33%      (1,973,238 rps)   (avg: 506ns)
   zod               -90.99%        (820,109 rps)   (avg: 1μs)
-----------------------------------------------------------------------

Suite: Complex object
✔ joi                    26,548 rps
✔ yup                    11,851 rps
✔ ajv                 1,327,387 rps
✔ validate.js            32,154 rps
✔ io-ts                 233,786 rps
✔ zod                    99,270 rps

   joi                  -98%         (26,548 rps)   (avg: 37μs)
   yup               -99.11%         (11,851 rps)   (avg: 84μs)
   ajv                    0%      (1,327,387 rps)   (avg: 753ns)
   validate.js       -97.58%         (32,154 rps)   (avg: 31μs)
   io-ts             -82.39%        (233,786 rps)   (avg: 4μs)
   zod               -92.52%         (99,270 rps)   (avg: 10μs)
```