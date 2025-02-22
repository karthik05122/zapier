"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
// Initialize Prisma and Kafka clients
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
});
// Kafka topic name
const TOPIC_NAME = "zap-events";
// Utility function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafka.producer();
        yield producer.connect();
        console.log("✅ Outbox Processor Started... Listening for pending events.");
        while (true) {
            try {
                // Fetch pending events from zapRunOutbox
                const pendingRows = yield client.zapRunOutbox.findMany({
                    where: {},
                    take: 10
                });
                if (pendingRows.length > 0) {
                    console.log(`🚀 Processing ${pendingRows.length} events...`);
                    // Send messages to Kafka
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: pendingRows.map(r => ({
                            value: r.zapRunId
                        }))
                    });
                    // Delete processed records
                    yield client.zapRunOutbox.deleteMany({
                        where: {
                            id: {
                                in: pendingRows.map(x => x.id)
                            }
                        }
                    });
                    console.log("✅ Successfully processed and deleted events.");
                }
                else {
                    console.log("⏳ No pending events. Sleeping...");
                }
            }
            catch (error) {
                console.error("❌ Error processing events:", error);
            }
            // Sleep for 2 seconds before checking again
            yield sleep(4000);
        }
    });
}
// Run the processor
main().catch(error => {
    console.error("❌ Fatal error in outbox processor:", error);
});
