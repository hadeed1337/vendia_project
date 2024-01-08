import { createVendiaClient } from "@vendia/client";

const client = createVendiaClient({
    apiUrl: `https://j2e4zmpw61.execute-api.us-west-2.amazonaws.com/graphql/`,
    
    apiKey: '6QWFBSGgE98WHzjkBC7qLQ3122HMxDCBTXxWHjyoNu98', // <---- API key
  })

  export const VendiaClient = () => {
    return {client};
  };