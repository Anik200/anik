#include <stdio.h>
#include <stdlib.h>

// Define a node structure
struct Node {
    int data;
    struct Node* next;
};

// Function to create a new node
struct Node* create_node(int data) {
    struct Node* new_node = (struct Node*)malloc(sizeof(struct Node));
    new_node->data = data;
    new_node->next = NULL;
    return new_node;
}

// Function to insert a node at the beginning
struct Node* insert_at_beginning(struct Node* head, int data) {
    struct Node* new_node = create_node(data);
    new_node->next = head;
    return new_node;
}

// Function to print the linked list
void print_list(struct Node* head) {
    struct Node* current = head;
    while (current != NULL) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\n");
}

// Function to free the linked list
void free_list(struct Node* head) {
    struct Node* temp;
    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

int main() {
    struct Node* head = NULL;
    
    // Insert some elements
    head = insert_at_beginning(head, 30);
    head = insert_at_beginning(head, 20);
    head = insert_at_beginning(head, 10);
    
    printf("Linked List: ");
    print_list(head);
    
    // Free the list
    free_list(head);
    
    return 0;
}