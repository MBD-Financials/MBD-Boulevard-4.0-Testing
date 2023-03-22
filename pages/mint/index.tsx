import { NextPage } from 'next'
import { Text, Flex, Box } from '../../components/primitives'
import Layout from 'components/Layout'
import { useMediaQuery } from 'react-responsive'
import React, { useState} from 'react'
import Input from 'components/primitives/Input'
import TextArea from 'components/primitives/TextArea'
import { useUserCollections } from '@reservoir0x/reservoir-kit-ui'
import { useMounted } from '../../hooks'
import { ConnectWalletButton } from 'components/ConnectWalletButton'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { COLLECTION_SET_ID, COMMUNITY } from 'pages/_app'
import ChainToggle from 'components/common/ChainToggle'
import { Head } from 'components/Head'
import Button from 'components/primitives/Button'
import DropZone from 'components/DropZone/DropZone'
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useSigner, useAccount } from 'wagmi'
import { useRouter } from "next/router";

const IndexPage: NextPage = () => {
  const { address, isConnected } = useAccount()
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [properties, setProperties] = useState("");
  const [image, setImage] = useState(null);
  const { data: signer, isError, isLoading } = useSigner()
  const router = useRouter();


     //---FETCHING SMART CONTRACT
const fetchContract = async () => {

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.NEXT_PUBLIC_PRIVATE_KEY!,
    "polygon"
  );

  const mintSigner = await sdk.getContract(
    // Replace this with your NFT Collection contract address
    "0x42EB6537AFD6a6DD5d5feB9705eb33A59Db143B4",
    "nft-collection"
  );
  
  const thirdwebSDK = ThirdwebSDK.fromSigner(signer!);
  const userContract = await thirdwebSDK.getContract(
    "0x42EB6537AFD6a6DD5d5feB9705eb33A59Db143B4",
    "nft-collection"
  );
  return [mintSigner, userContract];
}


const mintNFT = async (name:string, image:string, description:string) => {
  
  if (!name || !description || !image)
  return;

  try {
    const contracts = await fetchContract();
    const mintSigner = contracts[0];
    const contract = contracts[1];
    const data = {
      to: address!,
      metadata: {
        name,
        description,
        image,
      },
    };
    const signedPayload = await mintSigner.erc721.signature.generate(data);

    const isValid = await contract.erc721.signature.verify(signedPayload);
    console.log(isValid);

    const tx = await contract.erc721.signature.mint(signedPayload);
    alert("Minted Succesfully!!");
    // const nft = await tx.data(); // (optional) fetch details of minted NFT

    router.push("/portfolio");
  } catch (error) {
    alert(error)
  }
};


const [tokenFiltersOpen, setTokenFiltersOpen] = useState(true)
const [filterCollection, setFilterCollection] = useState<string | undefined>(
  undefined
)
  const isSmallDevice = useMediaQuery({ maxWidth: 905 })
  const isMounted = useMounted()
  
  
  

  let collectionQuery: Parameters<typeof useUserCollections>['1'] = {
    limit: 100,
  }

  if (COLLECTION_SET_ID) {
    collectionQuery.collectionsSetId = COLLECTION_SET_ID
  } else if (COMMUNITY) {
    collectionQuery.community = COMMUNITY
  }

  const { data: collections, isLoading: collectionsLoading } =
    useUserCollections(address as string, collectionQuery)

  if (!isMounted) {
    return null
  }

 

  

  return (
    <>
      <Head />
      <Layout>
        <Flex
          direction="column"
          
          css={{
            px: '$4',
            py: 40,
            '@sm': {
              px: '$5',
            },
          }}
        >
          {isConnected ? (
            <>
            
            <Flex direction="column" css={{ gap: '$4' }}>
              
              <Flex direction="column" align="center" justify="between" css={{ gap: '$4' }}>
                <Text style="h2" css={{}}>
                Create New NFT
                </Text>
                

                <Text style="h2" css={{}}>
                Image, Video, Audio, or 3D Model
                </Text>

                <Text style="body1" css={{}}>
                File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 100 MB
                </Text>
                <div style={{
                  "width":'100%',
                  "border": "4px dotted",
                  'border-radius': '1rem',
                  'text-align':'center'
                  }}>

                
                <DropZone
                    title="JPG, PNG, WEBM , MAX 100MB"
                    heading="Drag & drop file"
                    subHeading="or Browse media on your device"
                    name={name}
                    website={website}
                    description={description}
                    category={category}
                    properties={properties}
                    setImage={setImage}
                  />
                
                </div>
              </Flex>

            </Flex>


            <Flex direction="column" justify="between" css={{ gap: '$4' }}>
                <Text
                  style="h4"
                  css={{ color: '$white', textAlign: 'center' }}
                >
                  Name
                </Text>

                <Input
                    type="text"
                    placeholder="Enter NFT Name"
                    onChange={(e) => setName(e.target.value)}
                />

                <Text
                  style="h4"
                  css={{ color: '$white', textAlign: 'center' }}
                >
                  Website
                </Text>
                
                <Input
                    type="text"
                    placeholder="Enter your website"
                    onChange={(e) => setWebsite(e.target.value)}
                />
                <Text
                  style="h4"
                  css={{ color: '$white', textAlign: 'center' }}
                >
                  Description
                </Text>

                <TextArea
                    placeholder="Enter Description"
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Text
                  style="h4"
                  css={{ color: '$white', textAlign: 'center' }}
                >
                  Properties
                </Text>
                
                <Input
                    type="text"
                    placeholder="Enter NFT Properties"
                    onChange={(e) => setProperties(e.target.value)}
                />

                <Button
                        css={{ flex: 0, justifyContent: 'center' , width: '20%', mx: 'auto'}}
                        corners="rounded"
                        type="button"
                        onClick = {async () =>{
                          mintNFT(
                            name,
                            image,
                            description
                          )
                        }}
                  >
                        Mint
                </Button>   

            </Flex>   
              

            </>
          ) : (
            <Flex
              direction="column"
              align="center"
              css={{ mx: 'auto', py: '120px', maxWidth: '350px', gap: '$4' }}
            >
              <Text style="h4" css={{ mb: '$3' }}>
                Mint your NFT instantly
              </Text>
              <Text css={{ color: '$gray11' }}>
                <FontAwesomeIcon icon={faWallet} size="2xl" />
              </Text>
              <Text
                style="body1"
                css={{ color: '$gray11', textAlign: 'center', mb: '$4' }}
              >
                Connect wallet to Mint your NFT.
              </Text>
              <ConnectWalletButton />
            </Flex>
          )}
        </Flex>
      </Layout>
    </>
  )
}

export default IndexPage
