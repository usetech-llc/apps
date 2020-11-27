import React from 'react';
import Step from 'semantic-ui-react/dist/commonjs/elements/Step';
import './styles.scss';

interface TradeContainerInterface {
  pageState: number;
}

/*
 if (pageState > 1) document.getElementById("sell1").classList.add("active");
    if (pageState > 2) document.getElementById("sell2").classList.add("active");
    if (pageState > 3) document.getElementById("sell3").classList.add("active");
 */

const TradeContainer = (props: TradeContainerInterface) => {
  const { pageState } = props;

  return (
    <div className='trade-container' id='tradecontainer'>
      <h3 id="tradeTitle">Selling this NFT</h3>

      { pageState <= 4 && (
        <Step.Group ordered>
          <Step completed={pageState > 1} active={pageState === 1}>
            <Step.Content>
              <Step.Title>Send NFT to Escrow</Step.Title>
            </Step.Content>
          </Step>

          <Step completed={pageState > 2} active={pageState === 2}>
            <Step.Content>
              <Step.Title>Wait for Deposit Registry</Step.Title>
            </Step.Content>
          </Step>

          <Step completed={pageState > 3} active={pageState === 3}>
            <Step.Content>
              <Step.Title>Set Price</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>
      )}

      { pageState >= 6 && (
        <Step.Group ordered>
          <Step completed={pageState > 7} active={pageState === 7}>
            <Step.Content>
              <Step.Title>Send KSM to Escrow</Step.Title>
            </Step.Content>
          </Step>

          <Step completed={pageState > 8} active={pageState === 8}>
            <Step.Content>
              <Step.Title>Wait for Deposit Registry</Step.Title>
            </Step.Content>
          </Step>

          <Step completed={pageState > 9} active={pageState === 9}>
            <Step.Content>
              <Step.Title>Exchange KSM for NFT</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>
      )}

    </div>
  )
};

export default TradeContainer;
