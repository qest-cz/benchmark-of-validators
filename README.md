# Benchmark of validators

Simple js validator benchmark

- build with: `yarn build`
- run with: `yarn benchmark`


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
✔ io-ts                2,820,844 rps
✔ zod                    854,230 rps
✔ validator.js           720,204 rps
✔ validate.js            366,178 rps
✔ validatorjs            213,912 rps
✔ joi                    184,973 rps
✔ ajv                  9,193,894 rps
✔ mschema                932,706 rps
✔ parambulator            34,459 rps
✔ yup                     43,402 rps

   io-ts              -69.32%      (2,820,844 rps)   (avg: 354ns)
   zod                -90.71%        (854,230 rps)   (avg: 1μs)
   validator.js       -92.17%        (720,204 rps)   (avg: 1μs)
   validate.js        -96.02%        (366,178 rps)   (avg: 2μs)
   validatorjs        -97.67%        (213,912 rps)   (avg: 4μs)
   joi                -97.99%        (184,973 rps)   (avg: 5μs)
   ajv                     0%      (9,193,894 rps)   (avg: 108ns)
   mschema            -89.86%        (932,706 rps)   (avg: 1μs)
   parambulator       -99.63%         (34,459 rps)   (avg: 29μs)
   yup                -99.53%         (43,402 rps)   (avg: 23μs)
```