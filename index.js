const SignalingClient =
  require("amazon-kinesis-video-streams-webrtc").SignalingClient;
const Role = require("amazon-kinesis-video-streams-webrtc").Role;
const AWS = require("aws-sdk");
var express = require("express");
var cors = require("cors");
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accessKeyId = "AKIASE47AYPKFPAJJLHA";
const secretAccessKey = "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";
const region = "ca-central-1";

// const response = {
//   ChannelName: "test123",
//   ChannelARN: channelARN,
//   ChannelType: "SINGLE_MASTER",
//   ChannelStatus: "ACTIVE",
//   CreationTime: "September 27, 2023 10:25:03 AM",
//   SingleMasterConfiguration: {
//     MessageTtlSeconds: 60,
//   },
//   Version: version,
//   ResourceEndpointList: [
//     {
//       Protocol: "HTTPS",
//       ResourceEndpoint: "",
//     },
//     {
//       Protocol: "WSS",
//       ResourceEndpoint: "",
//     },
//   ],
//   IceServerList: [
//     {
//       Uris: [],
//       Username: "",
//       Password: "",
//       Ttl: 300,
//     },
//     {
//       Uris: [],
//       Username: "",
//       Password: "",
//       Ttl: 300,
//     },
//   ],
//   PresignedWss: "",
//   status_code: 200,
// };

app.get('/',async (req,res) =>{
  res.send('Kinesis Server')
})

app.post("/school-streaming/school/:school_id/start", async (req, res) => {
  try {
    let response={}


    const school_id = req.params.school_id;

   const channelInfo =  await createSignalingChannel(`school-${school_id}`);
   if(channelInfo?.error) res.json({success:false,message:channelInfo.error})
    console.log("master calling...");

    response = {...channelInfo,
    ResourceEndpointList: [
    {
      Protocol: "HTTPS",
      ResourceEndpoint: "",
    },
    {
      Protocol: "WSS",
      ResourceEndpoint: "",
    },
  ],
    }

    const kinesisVideoClient = new AWS.KinesisVideo({
      region,
      accessKeyId,
      secretAccessKey,
      correctClockSkew: true,
    });
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
      .getSignalingChannelEndpoint({
        ChannelARN: channelInfo.ChannelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ["WSS", "HTTPS"],
          Role: Role.MASTER,
        },
      })
      .promise();

    const endpointsByProtocol =
      getSignalingChannelEndpointResponse.ResourceEndpointList.reduce(
        (endpoints, endpoint) => {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
          return endpoints;
        },
        {}
      );

    response.ResourceEndpointList[0].ResourceEndpoint =
      endpointsByProtocol.HTTPS;
    response.ResourceEndpointList[1].ResourceEndpoint = endpointsByProtocol.WSS;

    const kinesisVideoSignalingChannelsClient =
      new AWS.KinesisVideoSignalingChannels({
        region,
        accessKeyId,
        secretAccessKey,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
      });
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
      .getIceServerConfig({
        ChannelARN: channelInfo.ChannelARN,
      })
      .promise();
    const iceServers = [
      { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` },
    ];
    getIceServerConfigResponse.IceServerList.forEach((iceServer) =>
      iceServers.push({
        urls: iceServer.Uris,
        username: iceServer.Username,
        credential: iceServer.Password,
      })
    );
    response.IceServerList = iceServers;

  

    res.json({
      ...response,
    });
  } catch (error) {
    console.log({error})
    res.json({
      success: false,
      message: error,
    });
  }
});

app.post("/school-streaming/school/:school_id/view", async (req, res) => {
  try {
    let response={}


    const school_id = req.params.school_id;

   const channelInfo =  await createSignalingChannel(`school-${school_id}`);
   if(channelInfo?.error) res.json({success:false,message:channelInfo.error})
    console.log("viewer calling...");

    response = {...channelInfo,
    ResourceEndpointList: [
    {
      Protocol: "HTTPS",
      ResourceEndpoint: "",
    },
    {
      Protocol: "WSS",
      ResourceEndpoint: "",
    },
  ],
    }

    const kinesisVideoClient = new AWS.KinesisVideo({
      region,
      accessKeyId,
      secretAccessKey,
      correctClockSkew: true,
    });
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
      .getSignalingChannelEndpoint({
        ChannelARN: channelInfo.ChannelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ["WSS", "HTTPS"],
          Role: Role.VIEWER,
        },
      })
      .promise();

    const endpointsByProtocol =
      getSignalingChannelEndpointResponse.ResourceEndpointList.reduce(
        (endpoints, endpoint) => {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
          return endpoints;
        },
        {}
      );

    response.ResourceEndpointList[0].ResourceEndpoint =
      endpointsByProtocol.HTTPS;
    response.ResourceEndpointList[1].ResourceEndpoint = endpointsByProtocol.WSS;

    const kinesisVideoSignalingChannelsClient =
      new AWS.KinesisVideoSignalingChannels({
        region,
        accessKeyId,
        secretAccessKey,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
      });
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
      .getIceServerConfig({
        ChannelARN: channelInfo.ChannelARN,
      })
      .promise();
    const iceServers = [
      { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` },
    ];
    getIceServerConfigResponse.IceServerList.forEach((iceServer) =>
      iceServers.push({
        urls: iceServer.Uris,
        username: iceServer.Username,
        credential: iceServer.Password,
      })
    );
    response.IceServerList = iceServers;

  

    res.json({
      ...response,
    });
  } catch (error) {
    console.log({error})
    res.json({
      success: false,
      message: error,
    });
  }
});


// app.post("/school-streaming/school/:school_id/view", async (req, res) => {
//   try {
//     console.log("view calling...");
//     const school_id = req.params.school_id;
//     const kinesisVideoClient = new AWS.KinesisVideo({
//       region,
//       accessKeyId,
//       secretAccessKey,
//       correctClockSkew: true,
//     });
//     const getSignalingChannelEndpointResponse = await kinesisVideoClient
//       .getSignalingChannelEndpoint({
//         ChannelARN: channelARN,
//         SingleMasterChannelEndpointConfiguration: {
//           Protocols: ["WSS", "HTTPS"],
//           Role: Role.VIEWER,
//         },
//       })
//       .promise();

//     const endpointsByProtocol =
//       getSignalingChannelEndpointResponse.ResourceEndpointList.reduce(
//         (endpoints, endpoint) => {
//           endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
//           return endpoints;
//         },
//         {}
//       );

//     response.ResourceEndpointList[0].ResourceEndpoint =
//       endpointsByProtocol.HTTPS;
//     response.ResourceEndpointList[1].ResourceEndpoint = endpointsByProtocol.WSS;

//     const kinesisVideoSignalingChannelsClient =
//       new AWS.KinesisVideoSignalingChannels({
//         region,
//         accessKeyId,
//         secretAccessKey,
//         endpoint: endpointsByProtocol.HTTPS,
//         correctClockSkew: true,
//       });
//     const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
//       .getIceServerConfig({
//         ChannelARN: channelARN,
//       })
//       .promise();
//     const iceServers = [
//       { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` },
//     ];
//     getIceServerConfigResponse.IceServerList.forEach((iceServer) =>
//       iceServers.push({
//         urls: iceServer.Uris,
//         username: iceServer.Username,
//         credential: iceServer.Password,
//       })
//     );
//     response.IceServerList = iceServers;

//     // console.log({iceServers})

//     res.json({
//       ...response,
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       message: error,
//     });
//   }
// });

app.listen(4444, () => {
  console.log("server listen at port 4444");
});

// Create singalingChanel
/**
 * This file demonstrates the process of creating a KVS Signaling Channel.
 */
async function createSignalingChannel(channelName) {
  try {
    console.log(
      "[CREATE_SIGNALING_CHANNEL] Attempting to create signaling channel with name ",
      channelName
    );
    // Create KVS client
    const kinesisVideoClient = new AWS.KinesisVideo({
      region: region,
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    const describeSignalingChannelResponse = await kinesisVideoClient
      .describeSignalingChannel({
        ChannelName: channelName,
      })
      .promise();
    console.log({ describeSignalingChannelResponse });
    if (describeSignalingChannelResponse?.ChannelInfo) {
      return describeSignalingChannelResponse.ChannelInfo;
    } else {
      await kinesisVideoClient
        .createSignalingChannel({
          ChannelName: channelName,
        })
        .promise();

      // Get signaling channel ARN
      const getSignalingChannel = await kinesisVideoClient
        .describeSignalingChannel({
          ChannelName: channelName,
        })
        .promise();
      return getSignalingChannel.ChannelInfo;
    }
  } catch (e) {
    console.error("[CREATE_SIGNALING_CHANNEL] Encountered error:", e);
    return e
  }
}
