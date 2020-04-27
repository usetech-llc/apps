// Copyright 2017-2020 @polkadot/app-staking authors & contributors
import React, { useCallback } from 'react';

interface Props {
  currentStep: string;
  setCurrentStep: (id: string) => void;
  steps: string[];
  stepsState: string[];
}

function TabsHeader ({ currentStep, setCurrentStep, steps, stepsState }: Props): React.ReactElement<Props> {
  const setCurrentValue = useCallback((event: React.MouseEvent, id: string): void => {
    event.preventDefault();
    setCurrentStep(id);
  }, [setCurrentStep]);

  return (
    <div className='ui ordered top attached steps'>
      {steps.map((step, index) => (
        <a
          className={`${currentStep === step && 'active'} step ${stepsState[index]}`}
          key={step}
          onClick={(event): void => setCurrentValue(event, step)}>
          <div className='content'>
            <div className='title'>Account</div>
          </div>
        </a>
      ))
      }
    </div>
  );
}

export default React.memo(TabsHeader);
