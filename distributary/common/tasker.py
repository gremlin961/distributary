import pika
import atexit


class DistributaryTasker():

    def __init__(self,queue):
        self.queue=queue
        self.connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=self.queue, durable=True)

    def send(self, message):
        self.channel.basic_publish(exchange='',
                              routing_key=self.queue,
                              body=message,
                              properties=pika.BasicProperties( delivery_mode = 2,))
        print(" [x] Sent %r" % message)

    @atexit.register
    def cleanup(self):
        self.connection.close()
