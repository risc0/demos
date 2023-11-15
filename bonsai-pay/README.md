# This directory contains the source code for a RISC Zero demo applicaiton called bonsai-pay.

## Warning / Security Notice

**Bonsai Pay** is provided as an example / demo application in it's current form.
* **IT HAS NOT BEEN AUDITED**</span> and is **KNOWN** to contain security vulnerabilities:</font>
  * Versions committed prior to Nov 14, 2023 leaked recipient email addresses that were readable in on chain transactions.
  * The OIDC expiriation timer is not validated which could lead to:
     * Burning of transactions
     * Transactions living beyond expected life-times
     * other issues

This code is provided as-is as a benefit to the public good, however should not be used with out a comprehensive 
security analyis.  
