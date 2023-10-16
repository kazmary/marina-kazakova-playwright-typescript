# marina-kazakova-playwright-typescript
Web application UI tests repo. Playwright test framework w/ TypeScript for chromium, firefox, webkit  

Use node 16+

TO START:

- git clone git@github.com:kazmary/marina-kazakova-playwright-typescript.git

- npm install

TO RUN:

Tests in headless mode

 - `npm test` - run all tests for all 3 browsers: chromium, firefox, webkit
 - `npm run test-html-report` - run all tests and open report page
 - `npm run ctest` - run all tests in chrome
 - `npm run ftest` - run all tests in firefox
 - `npm run wtest` - run all tests in webkit (e.g. Safari),

 Tests in head mode
`npm run uitest` - start Playwright UI mode
