// Copyright 2020 UseTech authors & contributors

// global app props and types
import { ImageInterface } from '../../types';

// external imports
import React, { useCallback, useState } from 'react';
import { Button, Input } from '@polkadot/react-components';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// local imports and components
import useMintApi from '../../hooks/useMintApi';
import './styles.scss';

interface MintTokensProps {
  className?: string;
}

const maxFileSize = 5000000;

function MintTokens ({ className }: MintTokensProps): React.ReactElement<MintTokensProps> {
  const [images, setImages] = React.useState([]);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageName, setImageName] = useState<string | undefined>();
  const { serverIsReady, uploadImage } = useMintApi();

  const onChangeString = useCallback((value) => {
    console.log('onChangeString', value);
    setImageName(value);
  }, [setImageName]);

  const onFileUpload = useCallback((imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    // data for submit
    setImages(imageList as never[]);
    setImageBase64(imageList[0] ? imageList[0].dataURL : undefined);
  }, []);

  const onSaveToken = useCallback(() => {
    if (imageBase64 && imageName && serverIsReady) {
      console.log('onSaveToken');
      const newToken: ImageInterface = {
        address: '5G4WhxLhr9JtJhAggdz5v4G4v3nk9q32hQbepfXu9sCeAdWL',
        image: imageBase64,
        name: imageName
      };

      uploadImage(newToken);
    }
  }, [imageBase64, imageName]);

  console.log('serverIsReady',  serverIsReady);

  return (
    <main className="mint-tokens">
      <Header as='h1'>Mint Tokens</Header>
      <Form className='collection-search'>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Field>
                <Input
                  className='explorer--query label-small'
                  label={<span>Enter your token name</span>}
                  onChange={onChangeString}
                  // value={searchString}
                  placeholder='Token Name'
                  withLabel
                />
              </Form.Field>
              <Form.Field>
                <ImageUploading
                  value={images}
                  onChange={onFileUpload}
                  maxFileSize={maxFileSize}
                  maxNumber={1}
                >
                  {({
                      errors,
                      imageList,
                      onImageUpload,
                      onImageUpdate,
                      onImageRemove,
                      isDragging,
                      dragProps
                    }) => (
                    // write your building UI
                    <div className='upload__image-wrapper'>
                      { (!imageList || !imageList.length) && (
                        <div
                          className='drop-zone'
                          {...dragProps}
                          style={isDragging ? { background: "#A2DD18" } : undefined}
                          onClick={onImageUpload}
                        >
                          Click or Drop here
                        </div>
                      )}
                      {imageList.map((image, index) => (
                        <div key={index} className='image-item'>
                          <img src={image.dataURL} alt='' width='100' />
                          <div className='image-item__btn-wrapper'>
                            <Button
                              icon='pencil-alt'
                              label='Update'
                              onClick={onImageUpdate.bind(null, index)}
                            />
                            <Button
                              icon='trash-alt'
                              label='Remove'
                              onClick={onImageRemove.bind(null, index)}
                            />
                          </div>
                        </div>
                      ))}
                      {errors && (
                        <div>
                          {errors.maxNumber && <span>Number of selected images exceed maxNumber</span>}
                          {errors.acceptType && <span>Your selected file type is not allow</span>}
                          {errors.maxFileSize && <span>Selected file size exceed maxFileSize</span>}
                          {errors.resolution && <span>Selected file is not match your desired resolution</span>}
                        </div>
                      )}
                    </div>
                  )}
                </ImageUploading>
              </Form.Field>
              { (imageBase64 && imageName) && (
                <Button
                  icon='check'
                  label='Save'
                  onClick={onSaveToken}
                />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </main>
  );
}

export default React.memo(MintTokens);
