# This directory contains the source code for a RISC Zero demo applicaiton called bonsai-pay.

## Warning / Security Notice

**Bonsai Pay** is provided as an example / demo application in it's current form.
* **IT HAS NOT BEEN AUDITED**</span> and is **KNOWN** to contain security vulnerabilities:</font>
  * Versions committed prior to Nov 14, 2023 [leaked recipient email addresses](https://github.com/risc0/demos/security/advisories/GHSA-49mm-xg2c-r46j) that were readable in on chain transactions.
  * The [OIDC validation is insufficient](https://github.com/risc0/demos/security/advisories/GHSA-m9r5-6wx3-g33h) timer is not validated] which could lead to:
     * Burning of transactions
     * Transactions living beyond expected life-times
     * other issues

This code is provided as-is as a benefit to the public good, however should not be used with out a comprehensive 
security analyis.  
