import { MongoClient, ObjectID } from "mongodb";
import { config } from "../config";

export interface ClientToSave {
  name: string;
  cpf: string;
  rg: string;
  location: string;
  hydrometer: string;
  active: boolean;
}

export interface Client {
  _id: string;
  name: string;
  cpf: string;
  rg: string;
  location: string;
  hydrometer: string;
  active: boolean;
}

const uri = `mongodb://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const connectionPromise = (collectionName: string) =>
  client
    .connect()
    .then((client) => client.db("sicat"))
    .then((database) => database.collection(collectionName));

export const listClients: () => Promise<Client[]> = async () => {
  return connectionPromise("clients").then((collection) =>
    collection.find().toArray()
  );
};

export const saveClientList: (
  clientsToSave: ClientToSave[]
) => Promise<Client> = async (clientsToSave: ClientToSave[]) => {
  return connectionPromise("clients")
    .then((collection) => collection.insertMany(clientsToSave))
    .then((result) => result.ops[0]);
};

export const saveClient: (client: ClientToSave) => Promise<Client> = async (
  clientToSave: ClientToSave
) => {
  return connectionPromise("clients")
    .then((collection) => collection.insertOne(clientToSave))
    .then((result) => result.ops[0]);
};

export const updateClient: (client: Client) => Promise<number> = async (
  clientToUpdate: Client
) => {
  const objId = new ObjectID(clientToUpdate._id);
  return connectionPromise("clients")
    .then((collection) =>
      collection.updateOne({ _id: objId }, { $set: clientToUpdate })
    )
    .then((result) => result.modifiedCount);
};

export const deleteClient: (clientId: string) => Promise<boolean> = async (
  clientId: string
) => {
  const objId = new ObjectID(clientId);
  return connectionPromise("clients")
    .then((collection) => collection.deleteOne({ _id: objId }))
    .then((result) => (result.deletedCount === 1 ? true : false));
};
