import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

// Initialize Prisma and Kafka clients
const client = new PrismaClient();
const kafka = new Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
});

// Kafka topic name
const TOPIC_NAME = "zap-events";

// Utility function to add a delay
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const producer = kafka.producer();
    await producer.connect();

    console.log("✅ Outbox Processor Started... Listening for pending events.");

    while (true) {
        try {
            // Fetch pending events from zapRunOutbox
            const pendingRows = await client.zapRunOutbox.findMany({
                where: {},
                take: 10
            });

            if (pendingRows.length > 0) {
                console.log(`🚀 Processing ${pendingRows.length} events...`);

                // Send messages to Kafka
                await producer.send({
                    topic: TOPIC_NAME,
                    messages: pendingRows.map(r => ({
                        value: JSON.stringify({zapRunId: r.zapRunId, stage:0})
                    }))
                });

                // Delete processed records
                await client.zapRunOutbox.deleteMany({
                    where: {
                        id: {
                            in: pendingRows.map(x => x.id)
                        }
                    }
                });

                console.log("✅ Successfully processed and deleted events.");
            } else {
                console.log("⏳ No pending events. Sleeping...");
            }

        } catch (error) {
            console.error("❌ Error processing events:", error);
        }

        // Sleep for 2 seconds before checking again
        await sleep(4000);
    }
}

// Run the processor
main().catch(error => {
    console.error("❌ Fatal error in outbox processor:", error);
});
