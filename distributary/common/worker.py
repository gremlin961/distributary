import pika
import time


class DistributaryWorker():

    def __init__(self, queue):
        self.queue = queue
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=self.queue, durable=True)
        print(' [*] Waiting for messages.  To exit press CTRL+C')

    def callback(self, ch, method, properties, body):
       print(" [x] Received %r" % body)
       time.sleep(body.count(b'.'))
       print(" [x] Done")
       ch.basic_ack(delivery_tag = method.delivery_tag)

    def listen(self):
        self.channel.basic_qos(prefetch_count=1)
        self.channel.basic_consume(self.callback,queue=self.queue)
        self.channel.start_consuming()
