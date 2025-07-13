import { Kafka, Partitioners } from "kafkajs";
import logger from "./logger.config.js";

const kafkaClient = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const ADMIN = kafkaClient.admin();

const PRODUCER = kafkaClient.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

const TOPICS = JSON.parse(process.env.KAFKA_TOPICS || "[]");
const PARTITION_VALUE = Number(process.env.KAFKA_TOPIC_PARTITIONS || 1);
const REPLICATION_FACTOR = Number(process.env.KAFKA_TOPIC_REPLICATION_FACTOR || 1);


//admin connection to create topics
export const createTopics = async () => {
    try {
        await ADMIN.connect();
        logger.info("Kafka Admin connected");

        const topicsToCreate = TOPICS.map(topic => ({
            topic,
            numPartitions: PARTITION_VALUE,
            replicationFactor: REPLICATION_FACTOR,
        }));

        const result = await ADMIN.createTopics({
            topics: topicsToCreate,
            waitForLeaders: true,
        });

        logger.info(`Kafka Topics created: ${result ? TOPICS.join(", ") : "Already exists"}`);
    } catch (error) {
        logger.error("Error creating Kafka topics:", error);
    } finally {
        await ADMIN.disconnect();
        logger.info("Kafka Admin disconnected");
    }
};


//producer function to send messages 
export const sendMessage = async (topic, message) => {
    try {
        logger.info("Kafka Producer connected");

        const kafkaMessage = {
            topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        };

        logger.info(`Message sent to topic [${topic}]`, message);
    } catch (error) {
        logger.error(`Error sending message to topic [${topic}]:`, error);
    } finally {
        await PRODUCER.disconnect();
        logger.info("Kafka Producer disconnected");
    }
};

