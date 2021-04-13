import React, { useState } from "react";
import { WsProvider } from "@polkadot/api";
import customTypesRialto from "./customTypesRialto.json";
import customTypesMillau from "./customTypesMillau.json";
import { Keyring } from "@polkadot/api";
import { useApiConnection } from "./useApiConnection";
import "./App.css";

const sourceProvider = new WsProvider("wss://wss.rialto.brucke.link");
const targetProvider = new WsProvider("wss://wss.millau.brucke.link");

function App() {
  const [blockNumber, setBlockNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const { api: sourceApi, isApiReady: isSourceApiReady } = useApiConnection({
    provider: sourceProvider,
    types: customTypesRialto
  });
  const { api: targetApi, isApiReady: isTargetApiReady } = useApiConnection({
    provider: targetProvider,
    types: customTypesMillau
  });

  if (!isSourceApiReady || !isTargetApiReady) {
    return null;
  }

  async function sendMessage() {
    setStatus("Starting execution");
    const keyring = new Keyring({ type: "sr25519" });
    const account = keyring.addFromUri("//Alice");

    const transferCall = targetApi.tx.system.remark("0x0001");
    const call = transferCall.toU8a();

    const payload = {
      call,
      origin: {
        SourceAccount: account.addressRaw
      },
      spec_version: 1,
      weight: 1345000
    };

    const bridgeMessage = sourceApi.tx.bridgeMillauMessages.sendMessage(
      "0x00000000",
      payload,
      275002545
    );

    try {
      await bridgeMessage.signAndSend(
        account,
        { nonce: -1 },
        ({ events = [], status }) => {
          if (status.isReady) {
            setStatus("Ready");
          }
          if (status.isBroadcast) {
            setStatus("Broadcasted");
          }

          if (status.isInBlock) {
            setStatus("In Block");

            events.forEach(({ event: { data, method } }) => {
              if (method.toString() === "MessageAccepted") {
                sourceApi.rpc.chain
                  .getBlock(status.asInBlock)
                  .then((res) => {
                    const block = res.block.header.number.toString();
                    setBlockNumber(block);
                  })
                  .catch((e) => {
                    // HERE IS WHERE THE ERROR SHOULD BE CATCHED
                    throw new Error("Issue reading block information.");
                  });
              }
            });
          }
        }
      );
    } catch (e) {
      console.log("error", e);
    }
  }

  return (
    <div className="App">
      <button onClick={() => sendMessage()}>RUN</button>
      <div> {blockNumber && `BlockNumber: ${blockNumber}`}</div>
      <div> {status && `Execution Status: ${status}`}</div>
    </div>
  );
}

export default App;
